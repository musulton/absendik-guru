function requireEnv(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(
      `Missing ${name}. Copy mobile-guru/.env.example to .env and set values.`,
    );
  }
  return value.replace(/\/$/, "");
}

function parseEnvBool(raw: string | undefined, defaultValue: boolean): boolean {
  if (raw === undefined || raw.trim() === "") return defaultValue;
  const normalized = raw.trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return true;
  }
  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return false;
  }
  return defaultValue;
}

export const config = {
  /** Auth + cadangan Pro (project Supabase Catatan Guru). */
  guruSupabaseUrl: requireEnv(
    "EXPO_PUBLIC_GURU_SUPABASE_URL",
    process.env.EXPO_PUBLIC_GURU_SUPABASE_URL ??
      process.env.EXPO_PUBLIC_SUPABASE_URL,
  ),
  guruSupabaseAnonKey: requireEnv(
    "EXPO_PUBLIC_GURU_SUPABASE_ANON_KEY",
    process.env.EXPO_PUBLIC_GURU_SUPABASE_ANON_KEY ??
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  ),
  /** Opsional: klien Supabase sekolah (legacy, tidak dipakai di rilis saat ini). */
  schoolSupabaseUrl: requireEnv(
    "EXPO_PUBLIC_SCHOOL_SUPABASE_URL",
    process.env.EXPO_PUBLIC_SCHOOL_SUPABASE_URL ??
      process.env.EXPO_PUBLIC_GURU_SUPABASE_URL ??
      process.env.EXPO_PUBLIC_SUPABASE_URL,
  ),
  schoolSupabaseAnonKey: requireEnv(
    "EXPO_PUBLIC_SCHOOL_SUPABASE_ANON_KEY",
    process.env.EXPO_PUBLIC_SCHOOL_SUPABASE_ANON_KEY ??
      process.env.EXPO_PUBLIC_GURU_SUPABASE_ANON_KEY ??
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  ),
  /** @deprecated gunakan guruSupabaseUrl */
  supabaseUrl: requireEnv(
    "EXPO_PUBLIC_SUPABASE_URL",
    process.env.EXPO_PUBLIC_GURU_SUPABASE_URL ??
      process.env.EXPO_PUBLIC_SUPABASE_URL,
  ),
  /** @deprecated gunakan guruSupabaseAnonKey */
  supabaseAnonKey: requireEnv(
    "EXPO_PUBLIC_SUPABASE_ANON_KEY",
    process.env.EXPO_PUBLIC_GURU_SUPABASE_ANON_KEY ??
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  ),
  apiBaseUrl: (
    process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3001"
  ).replace(/\/$/, ""),
  /** Origin web untuk jembatan OAuth (HTTPS publik). Jangan pakai IP LAN / localhost. */
  oauthWebOrigin: (
    process.env.EXPO_PUBLIC_OAUTH_WEB_ORIGIN?.trim() || "https://demo.absendik.id"
  ).replace(/\/$/, ""),
  ads: {
    /** Dev build: native AdMob/UMP bisa memunculkan overlay consent. Default off saat dev. */
    nativeEnabled: parseEnvBool(
      process.env.EXPO_PUBLIC_ENABLE_NATIVE_ADS,
      !__DEV__,
    ),
    bannerAndroid: process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID?.trim() ?? "",
    bannerIos: process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS?.trim() ?? "",
    interstitialAndroid:
      process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID?.trim() ?? "",
    interstitialIos:
      process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS?.trim() ?? "",
    /** Dev only: EEA | OTHER | REGULATED_US_STATE | DISABLED */
    consentDebugGeography:
      process.env.EXPO_PUBLIC_ADMOB_CONSENT_DEBUG_GEOGRAPHY?.trim() ?? "",
    testDeviceIdentifiers: (process.env.EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS ?? "")
      .split(",")
      .map((id: string) => id.trim())
      .filter(Boolean),
  },
  iap: {
    androidProductId:
      process.env.EXPO_PUBLIC_GURU_IAP_ANDROID_PRODUCT_ID?.trim() ??
      "guru_pro_monthly",
  },
  /** Sembunyikan login email/password — hanya Google. Default: true (disembunyikan). */
  hideEmailLogin: parseEnvBool(process.env.EXPO_PUBLIC_HIDE_EMAIL_LOGIN, true),
};

const LOOPBACK_API_HOST =
  /localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|10\.0\.2\.2/i;

const PRIVATE_LAN_HOST =
  /^(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})$/;

function shouldKeepHttpCleartext(baseUrl: string): boolean {
  try {
    const host = new URL(baseUrl).hostname;
    if (LOOPBACK_API_HOST.test(host)) return true;
    if (PRIVATE_LAN_HOST.test(host)) return true;
    return false;
  } catch {
    return LOOPBACK_API_HOST.test(baseUrl);
  }
}

/** URL API final — hindari redirect http→https yang menghapus header Authorization. */
export function resolveApiUrl(path: string): string {
  let base = config.apiBaseUrl;
  if (base.startsWith("http://") && !shouldKeepHttpCleartext(base)) {
    base = `https://${base.slice("http://".length)}`;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
