import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AppState } from "react-native";
import type { AdInterstitialPlacement } from "@/lib/ads/placements";
import {
  markSessionStart,
  recordInterstitialShown,
} from "@/lib/ads/frequency";
import { shouldShowAds, shouldShowInterstitial } from "@/lib/ads/policy";
import {
  isPrivacyOptionsAvailable,
  showAdsPrivacyOptions,
} from "@/lib/ads/consent";
import {
  isAdsNativeSupported,
  isAdsSdkReady,
  prepareAds,
  reloadFullScreenAds,
  showInterstitialIfReady,
  type AdsRuntime,
  resolveAdsRuntime,
} from "@/lib/ads";
import { AdInterstitialModal } from "@/components/ads/AdInterstitialModal";

type AdContextValue = {
  /** User gratis — slot iklan boleh ditampilkan. */
  adsEnabled: boolean;
  /** native = AdMob, preview = placeholder (Expo Go / modul belum link). */
  runtime: AdsRuntime;
  refreshAdsState: () => Promise<void>;
  requestInterstitial: (placement: AdInterstitialPlacement) => Promise<void>;
  showPrivacyOptions: () => Promise<boolean>;
  privacyOptionsAvailable: boolean;
};

const AdContext = createContext<AdContextValue | null>(null);

type Props = {
  children: ReactNode;
  onUpgradePress?: () => void;
};

export function AdProvider({ children, onUpgradePress }: Props) {
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [nativeReady, setNativeReady] = useState(false);
  const [privacyOptionsAvailable, setPrivacyOptionsAvailable] = useState(false);
  const [interstitialVisible, setInterstitialVisible] = useState(false);
  const [interstitialPlacement, setInterstitialPlacement] =
    useState<AdInterstitialPlacement | null>(null);

  const runtime = resolveAdsRuntime(adsEnabled, nativeReady);

  const refreshAdsState = useCallback(async () => {
    const tierOk = await shouldShowAds();
    if (!tierOk) {
      setAdsEnabled(false);
      setNativeReady(false);
      setPrivacyOptionsAvailable(false);
      return;
    }

    setAdsEnabled(true);

    if (!isAdsNativeSupported()) {
      setNativeReady(false);
      setPrivacyOptionsAvailable(false);
      return;
    }

    const ready = await prepareAds();
    setNativeReady(ready);
    if (ready) reloadFullScreenAds();
    setPrivacyOptionsAvailable(await isPrivacyOptionsAvailable());
  }, []);

  useEffect(() => {
    void markSessionStart();
    void refreshAdsState();
    const retry = setTimeout(() => void refreshAdsState(), 2500);
    return () => clearTimeout(retry);
  }, [refreshAdsState]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void refreshAdsState();
    });
    return () => sub.remove();
  }, [refreshAdsState]);

  const showPrivacyOptions = useCallback(async () => {
    const ok = await showAdsPrivacyOptions();
    if (ok) await refreshAdsState();
    return ok;
  }, [refreshAdsState]);

  const requestInterstitial = useCallback(
    async (placement: AdInterstitialPlacement) => {
      if (!(await shouldShowInterstitial(placement))) return;

      if (isAdsNativeSupported() && isAdsSdkReady()) {
        if (showInterstitialIfReady()) {
          await recordInterstitialShown(placement);
        }
        return;
      }

      setInterstitialPlacement(placement);
      setInterstitialVisible(true);
      await recordInterstitialShown(placement);
    },
    [],
  );

  const closeInterstitial = useCallback(() => {
    setInterstitialVisible(false);
    setInterstitialPlacement(null);
  }, []);

  const value = useMemo(
    () => ({
      adsEnabled,
      runtime,
      refreshAdsState,
      requestInterstitial,
      showPrivacyOptions,
      privacyOptionsAvailable,
    }),
    [
      adsEnabled,
      runtime,
      refreshAdsState,
      requestInterstitial,
      showPrivacyOptions,
      privacyOptionsAvailable,
    ],
  );

  return (
    <AdContext.Provider value={value}>
      {children}
      <AdInterstitialModal
        visible={interstitialVisible}
        placement={interstitialPlacement}
        onClose={closeInterstitial}
        onUpgrade={onUpgradePress}
      />
    </AdContext.Provider>
  );
}

export function useAds(): AdContextValue {
  const ctx = useContext(AdContext);
  if (!ctx) {
    throw new Error("useAds harus dipakai di dalam AdProvider");
  }
  return ctx;
}

/** Aman di luar provider — tidak menampilkan iklan. */
export function useAdsOptional(): AdContextValue | null {
  return useContext(AdContext);
}
