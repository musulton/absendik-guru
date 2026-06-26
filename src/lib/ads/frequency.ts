import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AdInterstitialPlacement } from "@/lib/ads/placements";

const KEY_LAST_GLOBAL = "ads_last_interstitial_at";
const KEY_LAST_POST_SAVE = "ads_last_post_save_at";
const KEY_LAST_UTILITY = "ads_last_utility_at";
const KEY_DAILY_COUNT = "ads_interstitial_daily";
const KEY_SESSION_START = "ads_session_start_at";

/**
 * Profil nyaman + cukup monetisasi:
 * - Jeda global antar iklan apapun
 * - Bucket terpisah: setelah simpan vs utilitas (ekspor/sinkron)
 */
const GLOBAL_MIN_INTERVAL_MS = 4 * 60 * 1000;
const POST_SAVE_MIN_INTERVAL_MS = 8 * 60 * 1000;
const UTILITY_MIN_INTERVAL_MS = 5 * 60 * 1000;
const SESSION_GRACE_MS = 2 * 60 * 1000;
const MAX_PER_DAY = 6;

export const AD_CAPS = {
  interstitial: {
    globalMinIntervalMs: GLOBAL_MIN_INTERVAL_MS,
    postSaveMinIntervalMs: POST_SAVE_MIN_INTERVAL_MS,
    utilityMinIntervalMs: UTILITY_MIN_INTERVAL_MS,
    sessionGraceMs: SESSION_GRACE_MS,
    maxPerDay: MAX_PER_DAY,
  },
} as const;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function interstitialBucket(
  placement: AdInterstitialPlacement,
): "post_save" | "utility" {
  return placement === "attendance_saved" || placement === "grade_saved"
    ? "post_save"
    : "utility";
}

async function readDailyCount(key: string): Promise<number> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return 0;
  try {
    const parsed = JSON.parse(raw) as { date: string; count: number };
    return parsed.date === todayKey() ? parsed.count : 0;
  } catch {
    return 0;
  }
}

async function bumpDailyCount(key: string): Promise<void> {
  const count = await readDailyCount(key);
  await AsyncStorage.setItem(
    key,
    JSON.stringify({ date: todayKey(), count: count + 1 }),
  );
}

async function readTimestamp(key: string): Promise<number | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export async function markSessionStart(): Promise<void> {
  await AsyncStorage.setItem(KEY_SESSION_START, String(Date.now()));
}

export async function getSessionStartAt(): Promise<number> {
  const raw = await AsyncStorage.getItem(KEY_SESSION_START);
  return raw ? Number(raw) : Date.now();
}

export async function canShowInterstitialNow(
  placement: AdInterstitialPlacement,
): Promise<boolean> {
  const now = Date.now();
  const sessionStart = await getSessionStartAt();
  if (now - sessionStart < SESSION_GRACE_MS) return false;

  const daily = await readDailyCount(KEY_DAILY_COUNT);
  if (daily >= MAX_PER_DAY) return false;

  const lastGlobal = await readTimestamp(KEY_LAST_GLOBAL);
  if (lastGlobal != null && now - lastGlobal < GLOBAL_MIN_INTERVAL_MS) {
    return false;
  }

  const bucket = interstitialBucket(placement);
  const bucketKey =
    bucket === "post_save" ? KEY_LAST_POST_SAVE : KEY_LAST_UTILITY;
  const bucketInterval =
    bucket === "post_save"
      ? POST_SAVE_MIN_INTERVAL_MS
      : UTILITY_MIN_INTERVAL_MS;
  const lastBucket = await readTimestamp(bucketKey);
  if (lastBucket != null && now - lastBucket < bucketInterval) {
    return false;
  }

  return true;
}

export async function recordInterstitialShown(
  placement: AdInterstitialPlacement,
): Promise<void> {
  const now = Date.now();
  await AsyncStorage.setItem(KEY_LAST_GLOBAL, String(now));

  const bucket = interstitialBucket(placement);
  const bucketKey =
    bucket === "post_save" ? KEY_LAST_POST_SAVE : KEY_LAST_UTILITY;
  await AsyncStorage.setItem(bucketKey, String(now));
  await bumpDailyCount(KEY_DAILY_COUNT);
}
