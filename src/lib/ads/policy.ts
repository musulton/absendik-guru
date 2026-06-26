import type { AdBannerPlacement, AdInterstitialPlacement } from "@/lib/ads/placements";
import { canShowInterstitialNow } from "@/lib/ads/frequency";
import { isCloudSubscriptionActive } from "@/lib/storage-mode";

/** Tanpa langganan — tampilkan iklan. */
export async function shouldShowAds(): Promise<boolean> {
  return !(await isCloudSubscriptionActive());
}

const BANNER_PLACEMENTS = new Set<AdBannerPlacement>([
  "classes_list",
  "workspace_picker",
  "manage_hub",
  "class_hub",
  "class_picker",
  "class_students",
  "subject_list",
  "recap",
]);

export function isBannerPlacementAllowed(placement: AdBannerPlacement): boolean {
  return BANNER_PLACEMENTS.has(placement);
}

const INTERSTITIAL_PLACEMENTS = new Set<AdInterstitialPlacement>([
  "attendance_saved",
  "grade_saved",
  "recap_export",
  "sync_complete",
]);

export async function shouldShowInterstitial(
  placement: AdInterstitialPlacement,
): Promise<boolean> {
  if (!INTERSTITIAL_PLACEMENTS.has(placement)) return false;
  if (!(await shouldShowAds())) return false;
  return canShowInterstitialNow(placement);
}
