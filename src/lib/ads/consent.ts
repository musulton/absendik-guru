import { config } from "@/lib/config";
import { getAdmobModule } from "@/lib/ads/native-module";

export type AdsConsentInfo = import("react-native-google-mobile-ads").AdsConsentInfo;
export type AdsConsentInfoOptions =
  import("react-native-google-mobile-ads").AdsConsentInfoOptions;

export type AdRequestOptions = {
  requestNonPersonalizedAdsOnly: boolean;
};

let cachedConsent: AdsConsentInfo | null = null;
let cachedRequestOptions: AdRequestOptions = {
  requestNonPersonalizedAdsOnly: true,
};
let gatherPromise: Promise<AdsConsentInfo | null> | null = null;

function parseDebugGeography():
  | AdsConsentInfoOptions["debugGeography"]
  | undefined {
  const raw = config.ads.consentDebugGeography.toUpperCase();
  const m = getAdmobModule();
  if (!m || !raw) return undefined;
  const { AdsConsentDebugGeography: Geo } = m;
  if (raw === "EEA") return Geo.EEA;
  if (raw === "NOT_EEA" || raw === "OTHER") return Geo.OTHER;
  if (raw === "REGULATED_US_STATE") return Geo.REGULATED_US_STATE;
  if (raw === "DISABLED") return Geo.DISABLED;
  return undefined;
}

function gatherOptions(): AdsConsentInfoOptions | undefined {
  if (!__DEV__) return undefined;
  const debugGeography = parseDebugGeography();
  const testDeviceIdentifiers = config.ads.testDeviceIdentifiers;
  if (!debugGeography && !testDeviceIdentifiers.length) return undefined;
  return {
    ...(debugGeography !== undefined ? { debugGeography } : {}),
    ...(testDeviceIdentifiers.length ? { testDeviceIdentifiers } : {}),
  };
}

export async function refreshRequestOptions(): Promise<AdRequestOptions> {
  const m = getAdmobModule();
  if (!m) {
    cachedRequestOptions = { requestNonPersonalizedAdsOnly: true };
    return cachedRequestOptions;
  }
  try {
    const gdprApplies = await m.AdsConsent.getGdprApplies();
    if (!gdprApplies) {
      cachedRequestOptions = { requestNonPersonalizedAdsOnly: false };
      return cachedRequestOptions;
    }
    const choices = await m.AdsConsent.getUserChoices();
    const personalized =
      choices.selectPersonalisedAds &&
      choices.createAPersonalisedAdsProfile &&
      choices.storeAndAccessInformationOnDevice;
    cachedRequestOptions = { requestNonPersonalizedAdsOnly: !personalized };
  } catch {
    cachedRequestOptions = { requestNonPersonalizedAdsOnly: true };
  }
  return cachedRequestOptions;
}

export function getCachedAdRequestOptions(): AdRequestOptions {
  return cachedRequestOptions;
}

export async function refreshAdsConsentInfo(): Promise<AdsConsentInfo | null> {
  const m = getAdmobModule();
  if (!m) return null;
  try {
    cachedConsent = await m.AdsConsent.getConsentInfo();
    return cachedConsent;
  } catch {
    return null;
  }
}

/** Minta / tampilkan form UMP bila diperlukan (GDPR opt-in). */
export async function gatherAdsConsent(): Promise<AdsConsentInfo | null> {
  const m = getAdmobModule();
  if (!m) return null;
  if (gatherPromise) return gatherPromise;

  gatherPromise = (async () => {
    try {
      const options = gatherOptions();
      cachedConsent = options
        ? await m.AdsConsent.gatherConsent(options)
        : await m.AdsConsent.gatherConsent();
    } catch {
      cachedConsent = (await refreshAdsConsentInfo()) ?? cachedConsent;
    }
    await refreshRequestOptions();
    return cachedConsent;
  })();

  try {
    return await gatherPromise;
  } finally {
    gatherPromise = null;
  }
}

/**
 * Jalankan consent + perbarui opsi permintaan iklan.
 * Ikuti pola Google: baca sesi sebelumnya paralel dengan gatherConsent.
 */
export async function prepareAdsConsent(): Promise<boolean> {
  const m = getAdmobModule();
  if (!m) return true;

  await Promise.all([refreshAdsConsentInfo(), gatherAdsConsent()]);
  const info = cachedConsent ?? (await refreshAdsConsentInfo());
  await refreshRequestOptions();
  return info?.canRequestAds ?? false;
}

export async function canRequestAds(): Promise<boolean> {
  if (cachedConsent?.canRequestAds) return true;
  const info = await refreshAdsConsentInfo();
  return info?.canRequestAds ?? false;
}

export async function isPrivacyOptionsAvailable(): Promise<boolean> {
  const m = getAdmobModule();
  if (!m) return false;
  const info = cachedConsent ?? (await refreshAdsConsentInfo());
  if (!info) return false;
  return (
    info.privacyOptionsRequirementStatus ===
    m.AdsConsentPrivacyOptionsRequirementStatus.REQUIRED
  );
}

/** Buka ulang form privasi UMP (Pengaturan). */
export async function showAdsPrivacyOptions(): Promise<boolean> {
  const m = getAdmobModule();
  if (!m) return false;
  try {
    cachedConsent = await m.AdsConsent.showPrivacyOptionsForm();
    await refreshRequestOptions();
    return true;
  } catch {
    return false;
  }
}

export function resetAdsConsentGatherState(): void {
  gatherPromise = null;
}
