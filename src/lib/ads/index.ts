export type {
  AdBannerPlacement,
  AdFreeZone,
  AdInterstitialPlacement,
} from "@/lib/ads/placements";
export { AD_FREE_ZONES } from "@/lib/ads/placements";
export { AD_CAPS } from "@/lib/ads/frequency";
export {
  shouldShowAds,
  shouldShowInterstitial,
  isBannerPlacementAllowed,
} from "@/lib/ads/policy";
export {
  disableNativeAdsModule,
  getAdmobModule,
  isAdsNativeSupported,
  resolveAdsRuntime,
  type AdsRuntime,
  type AdmobModule,
} from "@/lib/ads/native-module";
export {
  getCachedAdRequestOptions,
  isPrivacyOptionsAvailable,
  showAdsPrivacyOptions,
} from "@/lib/ads/consent";
export {
  getBannerAd,
  isAdsSdkReady,
  prepareAds,
  reloadFullScreenAds,
  showInterstitialIfReady,
} from "@/lib/ads/admob";
