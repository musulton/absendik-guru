import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getAutoCloudSyncEnabled,
  hasCloudSubscription,
} from "@/lib/storage-mode";
import { syncAllLocalDataToCloud } from "@/lib/local-cloud-sync";

const LAST_AUTO_SYNC_AT_KEY = "guru_auto_cloud_sync_at";
const MIN_AUTO_SYNC_INTERVAL_MS = 5 * 60 * 1000;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let syncInFlight = false;

async function getLastAutoSyncAt(): Promise<number> {
  const raw = await AsyncStorage.getItem(LAST_AUTO_SYNC_AT_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

async function setLastAutoSyncAt(ms: number): Promise<void> {
  await AsyncStorage.setItem(LAST_AUTO_SYNC_AT_KEY, String(ms));
}

export type AutoCloudSyncResult =
  | { ok: true; skipped: true; reason: string }
  | { ok: true; skipped: false; syncedAt: string }
  | { ok: false; error: string };

/** Cadangkan otomatis jika Pro + pengaturan aktif + interval cukup. */
export async function maybeAutoSyncToCloud(options?: {
  force?: boolean;
}): Promise<AutoCloudSyncResult> {
  if (syncInFlight) {
    return { ok: true, skipped: true, reason: "in_flight" };
  }

  if (!(await hasCloudSubscription())) {
    return { ok: true, skipped: true, reason: "not_pro" };
  }

  if (!(await getAutoCloudSyncEnabled())) {
    return { ok: true, skipped: true, reason: "disabled" };
  }

  const now = Date.now();
  if (!options?.force) {
    const last = await getLastAutoSyncAt();
    if (last > 0 && now - last < MIN_AUTO_SYNC_INTERVAL_MS) {
      return { ok: true, skipped: true, reason: "throttled" };
    }
  }

  syncInFlight = true;
  try {
    const result = await syncAllLocalDataToCloud();
    if (!result.ok) {
      if (result.error.code === "empty") {
        await setLastAutoSyncAt(now);
        return { ok: true, skipped: true, reason: "empty" };
      }
      return { ok: false, error: result.error.message };
    }
    await setLastAutoSyncAt(now);
    return { ok: true, skipped: false, syncedAt: new Date(now).toISOString() };
  } finally {
    syncInFlight = false;
  }
}

/** Jadwalkan cadangan otomatis ~30 detik setelah perubahan data lokal. */
export function scheduleAutoCloudSync(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void maybeAutoSyncToCloud();
  }, 30_000);
}
