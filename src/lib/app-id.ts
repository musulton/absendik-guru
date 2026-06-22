/**
 * Selaras `src/lib/mobile-app-ids.ts` (monorepo) & `app.json`.
 * Ubah di kedua tempat jika ganti bundle/scheme.
 */
export const APP_ID = {
  androidPackage: "com.absendik.guru",
  iosBundleId: "com.absendik.guru",
  urlScheme: "absendikguru",
  expoSlug: "absendik-guru",
} as const;

export const OAUTH_CALLBACK_PATH = "auth/callback";

export function guruOAuthDeepLink(): string {
  return `${APP_ID.urlScheme}://${OAUTH_CALLBACK_PATH}`;
}
