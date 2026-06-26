/**
 * Selaras `src/lib/mobile-app-ids.ts` (monorepo) & `app.json`.
 * Ubah di kedua tempat jika ganti bundle/scheme.
 */
export const APP_ID = {
  androidPackage: "com.catatanguru.app",
  iosBundleId: "com.catatanguru.app",
  urlScheme: "catatanguru",
  expoSlug: "catatan-guru",
} as const;

export const OAUTH_CALLBACK_PATH = "auth/callback";

/** Path halaman web jembatan OAuth (Next.js di EXPO_PUBLIC_OAUTH_WEB_ORIGIN). */
export const OAUTH_WEB_CALLBACK_PATH = "auth/catatan-guru/mobile-callback";

export function guruOAuthDeepLink(): string {
  return `${APP_ID.urlScheme}://${OAUTH_CALLBACK_PATH}`;
}
