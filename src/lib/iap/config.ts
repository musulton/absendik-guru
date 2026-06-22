import { config } from "@/lib/config";

export const GURU_PRO_ANDROID_PRODUCT_ID =
  config.iap.androidProductId || "guru_pro_monthly";

/** Dev only — aktifkan Pro tanpa Play Store (Expo Go / emulator tanpa billing). */
export const GURU_IAP_DEV_UNLOCK =
  __DEV__ && process.env.EXPO_PUBLIC_GURU_IAP_DEV_UNLOCK === "true";
