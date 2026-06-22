import { apiSubscriptionStatus } from "@/lib/api";
import type { GuruProDeviceStatus, GuruProSubscriptionStatus } from "@/lib/types";
import {
  activateCloudSubscription,
  setAutoCloudSyncEnabled,
  setCloudSubscriptionActive,
} from "@/lib/storage-mode";
import { GURU_IAP_DEV_UNLOCK } from "@/lib/iap/config";

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
