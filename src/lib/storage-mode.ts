import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_MODE_KEY = "guru_storage_mode";
export const CLOUD_SUBSCRIPTION_KEY = "guru_cloud_subscription_active";
export const AUTO_CLOUD_SYNC_KEY = "guru_auto_cloud_sync_enabled";

/** @deprecated flag global per perangkat — dipetakan ke akun saat migrasi */
const LEGACY_ONBOARDING_DONE_KEY = "guru_onboarding_done";

function onboardingDoneKey(userId: string): string {
  return `guru_onboarding_done_${userId}`;
}

/** Data utama selalu di perangkat (nilai tetap "local"). */
export async function getStorageMode(): Promise<"local"> {
  const raw = await AsyncStorage.getItem(STORAGE_MODE_KEY);
  if (raw !== "local") {
    await AsyncStorage.setItem(STORAGE_MODE_KEY, "local");
  }
  return "local";
}

export async function setStorageMode(_mode: "local"): Promise<void> {
  await AsyncStorage.setItem(STORAGE_MODE_KEY, "local");
}

export async function clearStorageMode(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_MODE_KEY);
}

/** Panduan sudah selesai untuk akun ini (muncul sekali setelah login pertama). */
export async function isOnboardingDone(userId: string): Promise<boolean> {
  const key = onboardingDoneKey(userId);
  const perUser = await AsyncStorage.getItem(key);
  if (perUser === "1") return true;

  const legacy = await AsyncStorage.getItem(LEGACY_ONBOARDING_DONE_KEY);
  if (legacy === "1") {
    await AsyncStorage.setItem(key, "1");
    return true;
  }

  return false;
}

export async function setOnboardingDone(userId: string): Promise<void> {
  await AsyncStorage.setItem(onboardingDoneKey(userId), "1");
}

/** Data utama selalu di perangkat (nilai tetap "local"). */
export async function isCloudSubscriptionActive(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(CLOUD_SUBSCRIPTION_KEY);
  return raw === "1";
}

export async function setCloudSubscriptionActive(active: boolean): Promise<void> {
  if (active) {
    await AsyncStorage.setItem(CLOUD_SUBSCRIPTION_KEY, "1");
  } else {
    await AsyncStorage.removeItem(CLOUD_SUBSCRIPTION_KEY);
  }
}

export async function clearCloudSubscription(): Promise<void> {
  await setCloudSubscriptionActive(false);
}

export async function getAutoCloudSyncEnabled(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(AUTO_CLOUD_SYNC_KEY);
  if (raw === null) {
    return await isCloudSubscriptionActive();
  }
  return raw === "1";
}

export async function setAutoCloudSyncEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(AUTO_CLOUD_SYNC_KEY, enabled ? "1" : "0");
}

export async function clearAutoCloudSyncPreference(): Promise<void> {
  await AsyncStorage.removeItem(AUTO_CLOUD_SYNC_KEY);
}

/** Aktifkan langganan; penyimpanan harian tetap di HP. */
export async function activateCloudSubscription(): Promise<void> {
  await setStorageMode("local");
  await setCloudSubscriptionActive(true);
  await setAutoCloudSyncEnabled(true);
}

/**
 * Migrasi pengguna lama: mode "cloud" tidak dipakai lagi sebagai sumber data.
 * Langganan tetap dipertahankan bila sudah aktif.
 */
export async function normalizeStorageProfile(): Promise<void> {
  await setStorageMode("local");
}

export async function hasCloudSubscription(): Promise<boolean> {
  return isCloudSubscriptionActive();
}
