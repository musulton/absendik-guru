import { Platform } from "react-native";
import { config } from "@/lib/config";
import {
  getCachedAdRequestOptions,
  prepareAdsConsent,
  refreshRequestOptions,
} from "@/lib/ads/consent";
import {
  disableNativeAdsModule,
  getAdmobModule,
  type AdmobModule,
} from "@/lib/ads/native-module";

export { isAdsNativeSupported } from "@/lib/ads/native-module";

type LoadedAdmob = NonNullable<AdmobModule>;

let initStarted = false;
let adsSdkReady = false;

export function isAdsSdkReady(): boolean {
  return adsSdkReady;
}

/**
 * UMP consent → init SDK → siap memuat iklan.
 * Return false bila consent belum mengizinkan atau native gagal di-init.
 */
export async function prepareAds(): Promise<boolean> {
  const m = getAdmobModule();
  if (!m) {
    if (__DEV__ && config.ads.nativeEnabled) {
      console.warn(
        "[ads] Native AdMob module belum tersedia. Rebuild dev build setelah mengaktifkan EXPO_PUBLIC_ENABLE_NATIVE_ADS=true.",
      );
    }
    return false;
  }

  try {
    const consentOk = await prepareAdsConsent();
    if (!consentOk) {
      if (__DEV__) {
        console.warn("[ads] UMP consent belum mengizinkan request iklan.");
      }
      adsSdkReady = false;
      return false;
    }

    if (!initStarted) {
      initStarted = true;
      await m.default().initialize();
      if (__DEV__) console.info("[ads] Google Mobile Ads SDK initialized.");
    }

    await refreshRequestOptions();
    adsSdkReady = true;
    return true;
  } catch (error) {
    if (__DEV__) console.warn("[ads] Google Mobile Ads init gagal.", error);
    initStarted = false;
    adsSdkReady = false;
    disableNativeAdsModule(error);
    return false;
  }
}

function pickPlatform(android: string, ios: string): string {
  return Platform.OS === "ios" ? ios : android;
}

function bannerUnitId(): string | null {
  const m = getAdmobModule();
  if (!m) return null;
  const env = pickPlatform(config.ads.bannerAndroid, config.ads.bannerIos);
  if (env) return env;
  return __DEV__ ? m.TestIds.ADAPTIVE_BANNER : null;
}

/** Komponen banner native + unit id, atau null bila tidak tersedia. */
export function getBannerAd(): {
  Component: LoadedAdmob["BannerAd"];
  size: string;
  unitId: string;
} | null {
  const m = getAdmobModule();
  const unitId = bannerUnitId();
  if (!m || !unitId || !adsSdkReady) return null;
  return {
    Component: m.BannerAd,
    size: m.BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
    unitId,
  };
}

function interstitialUnitId(): string | null {
  const m = getAdmobModule();
  if (!m) return null;
  const env = pickPlatform(
    config.ads.interstitialAndroid,
    config.ads.interstitialIos,
  );
  if (env) return env;
  return __DEV__ ? m.TestIds.INTERSTITIAL : null;
}

function appOpenUnitId(): string | null {
  const m = getAdmobModule();
  if (!m) return null;
  const env = pickPlatform(config.ads.appOpenAndroid, config.ads.appOpenIos);
  if (env) return env;
  return __DEV__ ? m.TestIds.APP_OPEN : null;
}

type FullScreenAd = {
  load: () => void;
  show: () => void;
  addAdEventListener: (type: string, listener: () => void) => () => void;
};

function createFullScreenManager(create: () => FullScreenAd | null) {
  let ad: FullScreenAd | null = null;
  let loaded = false;
  let loading = false;

  function reset(): void {
    loaded = false;
    loading = false;
    ad = null;
  }

  function preload(): void {
    const m = getAdmobModule();
    if (!m || !adsSdkReady || loading || loaded) return;
    const next = create();
    if (!next) return;
    loading = true;
    const offLoaded = next.addAdEventListener(m.AdEventType.LOADED, () => {
      loaded = true;
      loading = false;
    });
    const offError = next.addAdEventListener(m.AdEventType.ERROR, () => {
      loaded = false;
      loading = false;
      ad = null;
      offLoaded();
      offError();
    });
    ad = next;
    try {
      next.load();
    } catch {
      loading = false;
      ad = null;
      offLoaded();
      offError();
    }
  }

  function showIfReady(): boolean {
    const m = getAdmobModule();
    if (!m || !ad || !loaded) {
      preload();
      return false;
    }
    const current = ad;
    const offClosed = current.addAdEventListener(m.AdEventType.CLOSED, () => {
      loaded = false;
      ad = null;
      offClosed();
      preload();
    });
    try {
      current.show();
    } catch {
      loaded = false;
      ad = null;
      offClosed();
      preload();
      return false;
    }
    return true;
  }

  return { preload, showIfReady, reset };
}

const interstitial = createFullScreenManager(() => {
  const m = getAdmobModule();
  const unitId = interstitialUnitId();
  if (!m || !unitId) return null;
  return m.InterstitialAd.createForAdRequest(
    unitId,
    getCachedAdRequestOptions(),
  ) as unknown as FullScreenAd;
});

const appOpen = createFullScreenManager(() => {
  const m = getAdmobModule();
  const unitId = appOpenUnitId();
  if (!m || !unitId) return null;
  return m.AppOpenAd.createForAdRequest(
    unitId,
    getCachedAdRequestOptions(),
  ) as unknown as FullScreenAd;
});

export function reloadFullScreenAds(): void {
  interstitial.reset();
  appOpen.reset();
  if (adsSdkReady) {
    interstitial.preload();
    appOpen.preload();
  }
}

export const preloadInterstitial = interstitial.preload;
export const showInterstitialIfReady = interstitial.showIfReady;
export const preloadAppOpen = appOpen.preload;
export const showAppOpenIfReady = appOpen.showIfReady;
