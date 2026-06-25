import { apiSubscriptionStatus } from "@/lib/api";
import type { GuruProDeviceStatus, GuruProSubscriptionStatus } from "@/lib/types";
import {
  activateCloudSubscription,
  setAutoCloudSyncEnabled,
  setCloudSubscriptionActive,
  isCloudSubscriptionActive,
} from "@/lib/storage-mode";
import { GURU_IAP_DEV_UNLOCK } from "@/lib/iap/config";
import { Platform } from "react-native";
import { isAndroidIapSupported } from "@/lib/iap/native-module";
import { restoreAndroidProPurchases } from "@/lib/iap/android-pro";

export async function applyProSubscriptionActive(active: boolean): Promise<void> {
  await setCloudSubscriptionActive(active);
  if (active) {
    await setAutoCloudSyncEnabled(true);
  }
}

export async function syncProSubscriptionFromServer(): Promise<{
  active: boolean;
  subscription: GuruProSubscriptionStatus | null;
  proDevice: GuruProDeviceStatus | null;
}> {
  const res = await apiSubscriptionStatus();
  if (!res.ok) {
    return { active: false, subscription: null, proDevice: null };
  }

  const active = res.data.cloudSubscriptionActive;
  await applyProSubscriptionActive(active);
  return {
    active,
    subscription: res.data.subscription,
    proDevice: res.data.proDevice ?? null,
  };
}

/** Dev build tanpa Play Billing — aktifkan Pro lokal untuk uji fitur. */
export async function devUnlockProSubscription(): Promise<void> {
  if (!GURU_IAP_DEV_UNLOCK) {
    throw new Error("Dev unlock tidak aktif.");
  }
  await activateCloudSubscription();
}

/** Coba pulihkan langganan Play saat login di perangkat baru. */
export async function tryRestoreProSubscriptionOnBootstrap(): Promise<void> {
  if (Platform.OS !== "android" || !isAndroidIapSupported()) return;
  if (await isCloudSubscriptionActive()) return;

  const synced = await syncProSubscriptionFromServer();
  if (synced.active) return;

  const restored = await restoreAndroidProPurchases();
  if (restored.ok) {
    await applyProSubscriptionActive(true);
  }
}
