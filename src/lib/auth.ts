import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants, { ExecutionEnvironment } from "expo-constants";
import * as ExpoLinking from "expo-linking";
import { Linking, Platform } from "react-native";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { config } from "@/lib/config";
import {
  guruOAuthDeepLink,
  OAUTH_CALLBACK_PATH,
  OAUTH_WEB_CALLBACK_PATH,
} from "@/lib/app-id";

WebBrowser.maybeCompleteAuthSession();

const OAUTH_TIMEOUT_MS = 120_000;
/** Setelah popup ditutup — tunggu deep link (redirect lambat / Safari terpisah). */
const OAUTH_DISMISS_DEEP_LINK_GRACE_MS = 20_000;
/**
 * Popup ditutup cepat (< ini) dianggap batal manual.
 * Dinaikkan dari 4_000 → 6_000 agar lebih toleran di koneksi lambat:
 * browser bisa dismiss cepat karena timeout jaringan saat load halaman OAuth,
 * bukan karena user sengaja membatalkan.
 */
const OAUTH_QUICK_DISMISS_MS = 6_000;

/** Expo Go (StoreClient) — bukan dev build / standalone. */
export function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

function isIosSimulator(): boolean {
  return Platform.OS === "ios" && !Constants.isDevice;
}

function isLoopbackHost(host: string): boolean {
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

function readExpoPackagerHostPort(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    Constants.manifest2?.extra?.expoClient?.hostUri ??
    Constants.manifest?.debuggerHost ??
    null;
  if (!hostUri || typeof hostUri !== "string") return null;
  const hostPort = hostUri.split("/")[0]?.trim();
  return hostPort && hostPort.includes(":") ? hostPort : null;
}

function replaceLoopbackWithPackagerHost(uri: string): string {
  try {
    const parsed = new URL(uri);
    if (!isLoopbackHost(parsed.hostname)) return uri;
    const hostPort = readExpoPackagerHostPort();
    if (!hostPort) return uri;
    const [host, port] = hostPort.split(":");
    if (!host || !port) return uri;
    parsed.hostname = host;
    parsed.port = port;
    return parsed.toString();
  } catch {
    return uri;
  }
}

function buildExpoGoRedirectUri(): string {
  const uri = ExpoLinking.createURL(OAUTH_CALLBACK_PATH);
  if (isIosSimulator()) return uri;
  return replaceLoopbackWithPackagerHost(uri);
}

type MobileOAuthTargets = {
  /** URL penuh dikirim ke Supabase `redirectTo`. */
  supabaseRedirectTo: string;
  /**
   * Prefix HTTPS halaman web callback — dipakai sebagai:
   * 1. redirectUrl di openAuthSessionAsync Android (Custom Tab deteksi "selesai")
   * 2. Prefix matcher di callbackMatchers
   */
  browserRedirectPrefix: string;
  /**
   * Deep link tempat token diteruskan dari halaman web.
   * Expo Go: exp://host:port/--/auth/callback
   * Dev build / standalone: catatanguru://auth/callback
   */
  deepLinkReturnUri: string;
};

function buildMobileOAuthTargets(): MobileOAuthTargets {
  const deepLinkReturnUri = isExpoGo()
    ? buildExpoGoRedirectUri()
    : guruOAuthDeepLink();
  const browserRedirectPrefix = `${config.oauthWebOrigin}/${OAUTH_WEB_CALLBACK_PATH}`;
  const supabaseRedirectTo = `${browserRedirectPrefix}?expo=${encodeURIComponent(deepLinkReturnUri)}`;
  return { supabaseRedirectTo, browserRedirectPrefix, deepLinkReturnUri };
}

function assertOAuthWebOriginIsPublic(): void {
  try {
    const url = new URL(config.oauthWebOrigin);
    if (url.protocol !== "https:") {
      throw new Error("OAUTH_WEB_ORIGIN_NOT_HTTPS");
    }
    if (isLoopbackHost(url.hostname)) {
      throw new Error("OAUTH_WEB_ORIGIN_NOT_PUBLIC");
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("OAUTH_WEB_ORIGIN_")
    ) {
      throw error;
    }
    throw new Error("OAUTH_WEB_ORIGIN_INVALID");
  }
}

/** Callback yang wajib ada di Google Cloud Console (OAuth client Web). */
export function getSupabaseGoogleOAuthCallbackUrl(): string {
  return `${config.supabaseUrl}/auth/v1/callback`;
}

/**
 * Redirect URI untuk Supabase `redirectTo` — harus persis sama dengan entri
 * di Supabase Dashboard → Authentication → URL Configuration → Redirect URLs.
 */
export function getOAuthRedirectUri(): string {
  return buildMobileOAuthTargets().supabaseRedirectTo;
}

/** Entri tetap untuk Supabase → Redirect URLs (wildcard). */
export function getOAuthSupabaseAllowListHints(): string[] {
  return [
    `${config.oauthWebOrigin}/${OAUTH_WEB_CALLBACK_PATH}**`,
    guruOAuthDeepLink(),
  ];
}

/**
 * Matcher URL untuk mendeteksi callback OAuth yang valid.
 * Deduplicate: `redirectTo.split("?")[0]` identik dengan `browserRedirectPrefix`.
 */
function getOAuthCallbackMatchers(redirectTo: string): string[] {
  const { browserRedirectPrefix, deepLinkReturnUri } =
    buildMobileOAuthTargets();
  const base = redirectTo.split("?")[0] ?? redirectTo;
  const all = [browserRedirectPrefix, deepLinkReturnUri, base];
  return [...new Set(all)];
}

function assertOAuthRedirectReachable(redirectTo: string): void {
  if (isIosSimulator()) return;
  try {
    const host = new URL(redirectTo).hostname;
    if (isLoopbackHost(host)) {
      throw new Error("OAUTH_LOCALHOST_REDIRECT");
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "OAUTH_LOCALHOST_REDIRECT"
    ) {
      throw error;
    }
  }
}

function normalizeOAuthCallbackUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url.split("#")[0]?.replace(/\/$/, "") ?? url;
  }
}

/** Bandingkan redirect OAuth — query `expo` bisa encoded atau decoded. */
function oauthRedirectToMatches(expected: string, actual: string): boolean {
  try {
    const a = new URL(expected);
    const b = new URL(actual);
    if (a.origin !== b.origin || a.pathname !== b.pathname) return false;

    const expoA = a.searchParams.get("expo");
    const expoB = b.searchParams.get("expo");
    if (expoA != null || expoB != null) {
      return (
        decodeURIComponent(expoA ?? "") === decodeURIComponent(expoB ?? "")
      );
    }

    return a.search === b.search;
  } catch {
    return expected === actual;
  }
}

function oauthCallbackUrlMatches(
  callbackUrl: string,
  ...redirectPrefixes: string[]
): boolean {
  const matchers = redirectPrefixes.filter(Boolean);
  return matchers.some((redirectTo) => {
    const callback = normalizeOAuthCallbackUrl(callbackUrl);
    const redirect = normalizeOAuthCallbackUrl(redirectTo);
    if (callback.startsWith(redirect)) return true;
    try {
      const cb = new URL(callback);
      const rd = new URL(redirect);
      return (
        cb.protocol === rd.protocol &&
        cb.host === rd.host &&
        cb.pathname === rd.pathname
      );
    } catch {
      return false;
    }
  });
}

function throwIfOAuthUrlError(url: string): void {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  const description =
    typeof params.error_description === "string"
      ? params.error_description
      : typeof params.error === "string"
        ? params.error
        : null;
  const message = [errorCode, description].filter(Boolean).join(": ");
  if (!message) return;
  throw new Error(mapGoogleLoginError(message));
}

async function createSessionFromUrl(url: string): Promise<boolean> {
  throwIfOAuthUrlError(url);
  const { params } = QueryParams.getQueryParams(url);

  const accessToken = params.access_token;
  const refreshToken = params.refresh_token;
  if (typeof accessToken === "string" && typeof refreshToken === "string") {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    return true;
  }

  const authCode = params.code;
  if (typeof authCode === "string") {
    const { data, error } =
      await supabase.auth.exchangeCodeForSession(authCode);
    if (error) throw error;
    return Boolean(data.session);
  }

  return false;
}

function buildGoogleRedirectUriMismatchError(): string {
  const googleCallback = getSupabaseGoogleOAuthCallbackUrl();
  return (
    "GOOGLE_REDIRECT_URI_MISMATCH:" +
    "Di Google Cloud Console → Credentials → OAuth client (Web application), " +
    "tambahkan Authorized redirect URI:\n\n" +
    googleCallback +
    "\n\nClient ID & Secret Web tersebut harus sama dengan Supabase → Authentication → Providers → Google."
  );
}

function mapGoogleLoginError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("redirect_uri_mismatch") ||
    lower.includes("redirect uri mismatch")
  ) {
    return buildGoogleRedirectUriMismatchError();
  }
  if (
    lower.includes("provider is not enabled") ||
    (lower.includes("validation") && lower.includes("provider"))
  ) {
    return "GOOGLE_PROVIDER_DISABLED";
  }
  if (lower.includes("access_denied")) {
    return "Login dibatalkan.";
  }
  return message;
}

function mapPasswordLoginError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("email not confirmed")) {
    return "Email belum dikonfirmasi. Cek inbox atau minta admin sekolah mengirim ulang.";
  }
  if (lower.includes("invalid login credentials")) {
    return "Email atau password salah.";
  }
  return message;
}

export function isGoogleProviderDisabledError(message: string): boolean {
  return message === "GOOGLE_PROVIDER_DISABLED";
}

export function isGoogleRedirectUriMismatchError(message: string): boolean {
  return message.startsWith("GOOGLE_REDIRECT_URI_MISMATCH:");
}

export function getGoogleRedirectUriMismatchHelp(
  message: string,
): string | null {
  if (!isGoogleRedirectUriMismatchError(message)) return null;
  return message.slice("GOOGLE_REDIRECT_URI_MISMATCH:".length);
}

export function isOAuthCallbackError(message: string): boolean {
  return message.startsWith("OAUTH_CALLBACK_FAILED:");
}

export function getOAuthCallbackHelp(message: string): string | null {
  if (!isOAuthCallbackError(message)) return null;
  return message.slice("OAUTH_CALLBACK_FAILED:".length);
}

export function isOAuthLocalhostError(message: string): boolean {
  return message === "OAUTH_LOCALHOST_REDIRECT";
}

export function isOAuthWebOriginError(message: string): boolean {
  return (
    message === "OAUTH_WEB_ORIGIN_NOT_HTTPS" ||
    message === "OAUTH_WEB_ORIGIN_NOT_PUBLIC" ||
    message === "OAUTH_WEB_ORIGIN_INVALID"
  );
}

export function isOAuthTimeoutError(message: string): boolean {
  return message === "OAUTH_TIMEOUT";
}

export function isOAuthCancelledError(message: string): boolean {
  return message === "OAUTH_CANCELLED";
}

function buildOAuthCallbackError(redirectTo: string): string {
  const allowList = getOAuthSupabaseAllowListHints().join("\n");
  return (
    "OAUTH_CALLBACK_FAILED:" +
    "Tambahkan ke Supabase → Authentication → URL Configuration → Redirect URLs:\n\n" +
    allowList +
    "\n\nRedirect sesi ini:\n" +
    redirectTo +
    `\n\nSite URL = origin web OAuth (HTTPS, bukan localhost). Deploy halaman /${OAUTH_WEB_CALLBACK_PATH}.`
  );
}

function waitForOAuthCallback(
  authUrl: string,
  callbackMatchers: string[],
  deepLinkReturnUri: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const openedAt = Date.now();
    let dismissGraceTimer: ReturnType<typeof setTimeout> | null = null;
    let externalBrowser = false;

    const finish = (url: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(url);
    };

    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    const timeout = setTimeout(() => {
      fail(new Error("OAUTH_TIMEOUT"));
    }, OAUTH_TIMEOUT_MS);

    const linkingSub = Linking.addEventListener("url", ({ url }) => {
      if (__DEV__) console.info("[auth] deep link received:", url);
      if (!oauthCallbackUrlMatches(url, ...callbackMatchers)) return;
      finish(url);
    });

    const cleanup = () => {
      clearTimeout(timeout);
      if (dismissGraceTimer) clearTimeout(dismissGraceTimer);
      linkingSub.remove();
    };

    const scheduleDismissGrace = () => {
      if (externalBrowser) return;
      const elapsedMs = Date.now() - openedAt;
      const graceMs =
        elapsedMs >= OAUTH_QUICK_DISMISS_MS
          ? OAUTH_DISMISS_DEEP_LINK_GRACE_MS
          : 8_000;

      dismissGraceTimer = setTimeout(() => {
        if (settled) return;
        if (elapsedMs >= OAUTH_QUICK_DISMISS_MS) {
          fail(new Error(buildOAuthCallbackError(callbackMatchers.join("\n"))));
        } else {
          fail(new Error("OAUTH_CANCELLED"));
        }
      }, graceMs);
    };

    void launchOAuthBrowser(authUrl, deepLinkReturnUri)
      .then((launch) => {
        if (__DEV__) {
          console.info("[auth] OAuth browser launch:", launch.mode);
        }

        if (launch.mode === "external") {
          externalBrowser = true;
          return;
        }

        const result = launch.result;
        if (__DEV__) {
          console.info("[auth] openAuthSessionAsync result:", result.type);
        }

        if (result.type === "success" && result.url) {
          try {
            throwIfOAuthUrlError(result.url);
          } catch (err) {
            fail(err instanceof Error ? err : new Error(String(err)));
            return;
          }
          finish(result.url);
          return;
        }

        if (result.type === "cancel" || result.type === "dismiss") {
          scheduleDismissGrace();
          return;
        }

        if (result.type === "locked") {
          // Tidak perlu scheduleDismissGrace — browser masih terbuka, user sedang login
          return;
        }

        fail(new Error("OAUTH_BROWSER_FAILED"));
      })
      .catch((err) => {
        fail(err instanceof Error ? err : new Error(String(err)));
      });
  });
}

type OAuthBrowserLaunch =
  | { mode: "session"; result: WebBrowser.WebBrowserAuthSessionResult }
  | { mode: "external" };

/**
 * Buka browser OAuth.
 *
 * @param authUrl - URL OAuth dari Supabase
 * @param deepLinkReturnUri - Deep link tujuan akhir (exp:// atau catatanguru://)
 *
 * Android: openAuthSessionAsync memakai browserRedirectPrefix (HTTPS) sebagai
 * redirectUrl — Chrome Custom Tab hanya bisa mendeteksi redirect HTTPS sebagai
 * sinyal "selesai". Custom scheme tidak pernah "dikunjungi" tab sehingga tab
 * tidak tahu harus tutup. Halaman web callback (page.tsx) yang kemudian
 * meneruskan token ke deep link + menutup tab via window.close().
 *
 * iOS: ASWebAuthenticationSession punya mekanisme sendiri yang reliable untuk
 * custom scheme, jadi deepLinkReturnUri langsung dipakai.
 */
async function launchOAuthBrowser(
  authUrl: string,
  deepLinkReturnUri: string,
): Promise<OAuthBrowserLaunch> {
  if (Platform.OS === "android") {
    await WebBrowser.warmUpAsync().catch(() => undefined);
    await WebBrowser.mayInitWithUrlAsync(authUrl).catch(() => undefined);
  }

  const sessionRedirectUrl =
    Platform.OS === "android"
      ? buildMobileOAuthTargets().browserRedirectPrefix
      : deepLinkReturnUri;

  try {
    const result = await WebBrowser.openAuthSessionAsync(
      authUrl,
      sessionRedirectUrl,
      {
        showInRecents: true,
        preferEphemeralSession: Platform.OS === "ios",
        createTask: false,
      },
    );

    // ✅ Selalu return setelah openAuthSessionAsync berhasil dipanggil —
    // jangan fallback ke openBrowserAsync, apapun result.type-nya.
    // Tipe "locked" (Android) atau tipe lain tetap kita return sebagai session
    // agar waitForOAuthCallback bisa handle via Linking deep link.
    return { mode: "session", result };
  } catch (err) {
    if (__DEV__) console.warn("[auth] openAuthSessionAsync failed:", err);
    // Hanya fallback ke external browser jika openAuthSessionAsync throw error
    // (bukan return hasil apapun).
  }

  // Fallback: openAuthSessionAsync throw (tidak tersedia di platform ini)
  try {
    const opened = await WebBrowser.openBrowserAsync(authUrl, {
      createTask: false,
    });
    if (opened.type === "opened") {
      return { mode: "external" };
    }
  } catch (err) {
    if (__DEV__) console.warn("[auth] openBrowserAsync failed:", err);
  }

  const canOpen = await Linking.canOpenURL(authUrl);
  if (!canOpen) {
    throw new Error("OAUTH_BROWSER_FAILED");
  }
  await Linking.openURL(authUrl);
  return { mode: "external" };
}

export async function signInWithGoogle(): Promise<void> {
  const targets = buildMobileOAuthTargets();
  const redirectTo = targets.supabaseRedirectTo;
  const callbackMatchers = getOAuthCallbackMatchers(redirectTo);

  if (isExpoGo()) {
    assertOAuthRedirectReachable(targets.deepLinkReturnUri);
  } else {
    assertOAuthWebOriginIsPublic();
  }

  if (__DEV__) {
    console.info("[auth] OAuth redirectTo (Supabase):", redirectTo);
    console.info("[auth] deepLinkReturnUri:", targets.deepLinkReturnUri);
    console.info(
      "[auth] Supabase Redirect URLs (tetap):",
      getOAuthSupabaseAllowListHints(),
    );
  }

  if (Platform.OS === "android") {
    await WebBrowser.warmUpAsync().catch(() => undefined);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error) {
    if (isAuthNetworkFailure(error)) {
      throw new Error("GOOGLE_OAUTH_NETWORK");
    }
    throw new Error(mapGoogleLoginError(error.message));
  }
  if (!data.url) throw new Error("OAuth URL tidak tersedia");

  if (__DEV__) {
    try {
      const redirectParam = new URL(data.url).searchParams.get("redirect_to");
      if (redirectParam && !oauthRedirectToMatches(redirectTo, redirectParam)) {
        console.warn("[auth] redirect_to mismatch:", {
          expected: redirectTo,
          actual: redirectParam,
        });
      }
    } catch {
      /* ignore */
    }
  }

  let callbackUrl: string;
  try {
    callbackUrl = await waitForOAuthCallback(
      data.url,
      callbackMatchers,
      targets.deepLinkReturnUri,
    );
  } finally {
    if (Platform.OS === "android") {
      await WebBrowser.coolDownAsync().catch(() => undefined);
    }
  }

  if (!oauthCallbackUrlMatches(callbackUrl, ...callbackMatchers)) {
    throw new Error(buildOAuthCallbackError(redirectTo));
  }

  const sessionCreated = await createSessionFromUrl(callbackUrl);
  if (!sessionCreated) {
    throw new Error(buildOAuthCallbackError(redirectTo));
  }
}

export async function signInWithEmailPassword(
  email: string,
  password: string,
): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(mapPasswordLoginError(error.message));
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<void> {
  return signInWithEmailPassword(email, password);
}

function getSupabaseAuthStorageKeys(): string[] {
  try {
    const ref = new URL(config.supabaseUrl).hostname.split(".")[0];
    if (!ref) return [];
    const base = `sb-${ref}-auth-token`;
    return [base, `${base}-code-verifier`];
  } catch {
    return [];
  }
}

export function isAuthNetworkFailure(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("network request failed") ||
    msg.includes("fetch failed") ||
    msg.includes("network error") ||
    msg.includes("enotfound") ||
    msg.includes("aborted") ||
    err.name === "AuthRetryableFetchError"
  );
}

function isValidCachedSession(value: unknown): value is Session {
  if (!value || typeof value !== "object") return false;
  const session = value as Session;
  return (
    typeof session.access_token === "string" &&
    typeof session.refresh_token === "string"
  );
}

/** Baca sesi dari AsyncStorage tanpa refresh token (offline-first). */
export async function readCachedAuthSession(): Promise<Session | null> {
  const keys = getSupabaseAuthStorageKeys();
  const storageKey = keys[0];
  if (!storageKey) return null;

  const raw = await AsyncStorage.getItem(storageKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isValidCachedSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

const SESSION_LOAD_TIMEOUT_MS = 8_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("SESSION_LOAD_TIMEOUT")), ms);
    }),
  ]);
}

export function isGoogleOAuthNetworkError(message: string): boolean {
  return message === "GOOGLE_OAUTH_NETWORK";
}

/**
 * Muat sesi awal: tanpa cache langsung ke login (tanpa tunggu jaringan).
 * Dengan cache: coba refresh singkat, fallback ke cache saat offline/timeout.
 */
export async function loadAuthSession(): Promise<AuthSessionLoadResult> {
  const cached = await readCachedAuthSession();
  if (!cached) {
    return { session: null, offline: false };
  }

  try {
    const { data, error } = await withTimeout(
      supabase.auth.getSession(),
      SESSION_LOAD_TIMEOUT_MS,
    );
    if (!error) {
      return { session: data.session ?? cached, offline: false };
    }

    if (isAuthNetworkFailure(error)) {
      return { session: cached, offline: true };
    }

    return { session: data.session ?? cached, offline: false };
  } catch (err) {
    if (err instanceof Error && err.message === "SESSION_LOAD_TIMEOUT") {
      return { session: cached, offline: true };
    }
    if (isAuthNetworkFailure(err)) {
      return { session: cached, offline: true };
    }
    throw err;
  }
}

export type AuthSessionLoadResult = {
  session: Session | null;
  offline: boolean;
};

function isRecoverableSignOutError(error: {
  message?: string;
  status?: number;
}): boolean {
  const status = error.status;
  if (status === 401 || status === 403 || status === 404) return true;
  return isAuthNetworkFailure(new Error(error.message ?? ""));
}

/** Hapus sesi Supabase di perangkat — tanpa panggilan jaringan. */
export async function wipeLocalAuthSession(): Promise<void> {
  await supabase.auth.stopAutoRefresh().catch(() => undefined);
  const keys = getSupabaseAuthStorageKeys();
  if (keys.length > 0) {
    await AsyncStorage.multiRemove(keys);
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.stopAutoRefresh().catch(() => undefined);

  try {
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error && !isRecoverableSignOutError(error)) {
      console.warn("[auth] signOut local:", error.message);
    }
  } catch (err) {
    if (!isAuthNetworkFailure(err)) {
      console.warn("[auth] signOut:", err);
    }
  }

  await wipeLocalAuthSession();
  await WebBrowser.coolDownAsync().catch(() => undefined);
}

export async function getAccessToken(
  session?: { access_token?: string | null } | null,
): Promise<string | null> {
  if (session?.access_token) return session.access_token;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
