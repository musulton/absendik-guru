import Constants from "expo-constants";
import { config } from "@/lib/config";

export type AdmobModule = typeof import("react-native-google-mobile-ads");

let cachedModule: AdmobModule | null | undefined;
let nativeDisabled = false;

/** Cek apakah runtime boleh mencoba native AdMob (bukan Expo Go). */
function canUseNativeAdsRuntime(): boolean {
  if (nativeDisabled) return false;
  if (!config.ads.nativeEnabled) return false;
  if (Constants.appOwnership === "expo") return false;
  return true;
}

/** Matikan native ads permanen di sesi ini (fallback ke preview). */
export function disableNativeAdsModule(reason?: unknown): void {
  nativeDisabled = true;
  cachedModule = null;
  if (__DEV__ && reason) {
    console.warn(
      "[ads] Native AdMob tidak tersedia — mode preview aktif.",
      reason,
    );
  }
}

/** Lazy-load SDK hanya bila modul native terdeteksi. */
export function getAdmobModule(): AdmobModule | null {
  if (cachedModule !== undefined) return cachedModule;
  if (!canUseNativeAdsRuntime()) {
    cachedModule = null;
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require("react-native-google-mobile-ads") as AdmobModule;
  } catch (error) {
    disableNativeAdsModule(error);
    cachedModule = null;
  }

  return cachedModule;
}

/** True bila dev build / production sudah link AdMob. */
export function isAdsNativeSupported(): boolean {
  if (nativeDisabled) return false;
  return getAdmobModule() !== null;
}

export type AdsRuntime = "off" | "native" | "preview";

export function resolveAdsRuntime(
  adsEnabled: boolean,
  nativeReady: boolean,
): AdsRuntime {
  if (!adsEnabled) return "off";
  if (isAdsNativeSupported() && nativeReady) return "native";
  return "preview";
}
