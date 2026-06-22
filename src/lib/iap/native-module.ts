import { NativeModules, Platform } from "react-native";

let nativeSupported: boolean | null = null;
let nativeDisabled = false;

type IapModule = typeof import("react-native-iap");

let cachedModule: IapModule | null = null;

function hasLinkedNitroModules(): boolean {
  if (Platform.OS !== "android") return false;
  try {
    return Boolean(
      (NativeModules as Record<string, unknown>).NitroModules ??
        (NativeModules as Record<string, unknown>).RNnitroModules,
    );
  } catch {
    return false;
  }
}

export function isAndroidIapSupported(): boolean {
  if (Platform.OS !== "android") return false;
  if (nativeDisabled) return false;
  if (nativeSupported !== null) return nativeSupported;

  if (!hasLinkedNitroModules()) {
    nativeSupported = false;
    return false;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require("react-native-iap") as IapModule;
    nativeSupported = true;
  } catch {
    nativeSupported = false;
    cachedModule = null;
  }
  return nativeSupported;
}

export function getIapModule(): IapModule | null {
  if (!isAndroidIapSupported()) return null;
  return cachedModule;
}

export function disableAndroidIapModule(_error: unknown): void {
  nativeDisabled = true;
  nativeSupported = false;
  cachedModule = null;
}
