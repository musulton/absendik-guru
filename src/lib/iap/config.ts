import { config } from "@/lib/config";
import { isAndroidIapSupported } from "@/lib/iap/native-module";

export const GURU_PRO_ANDROID_PRODUCT_ID =
  config.iap.androidProductId || "guru_pro_monthly";

/** Dev only — aktifkan Pro tanpa Play Store (Expo Go / emulator tanpa billing). */
export const GURU_IAP_DEV_UNLOCK =
  __DEV__ && process.env.EXPO_PUBLIC_GURU_IAP_DEV_UNLOCK === "true";

/**
 * Dev build: Play Billing dimatikan secara default (hindari error init-connection).
 * Set `EXPO_PUBLIC_GURU_IAP_ENABLE_IN_DEV=true` saat uji langganan nyata.
 */
export const GURU_IAP_BILLING_ENABLED_IN_DEV =
  process.env.EXPO_PUBLIC_GURU_IAP_ENABLE_IN_DEV === "true";

/** Native IAP tersedia dan boleh mencoba koneksi billing. */
export function isAndroidBillingReady(): boolean {
  if (GURU_IAP_DEV_UNLOCK) return false;
  if (__DEV__ && !GURU_IAP_BILLING_ENABLED_IN_DEV) return false;
  return isAndroidIapSupported();
}
