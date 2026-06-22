import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { AD_CAPS, recordAppOpenShown } from "@/lib/ads/frequency";
import { shouldShowAppOpen } from "@/lib/ads/policy";
import { isAdsSdkReady, showAppOpenIfReady } from "@/lib/ads/admob";

/** App-open saat kembali ke app setelah lama ditinggal (hanya native SDK). */
export function useAppOpenAds(enabled: boolean) {
  const backgroundedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const sub = AppState.addEventListener(
      "change",
      (next: AppStateStatus) => {
        if (next === "background" || next === "inactive") {
          backgroundedAt.current = Date.now();
          return;
        }
        if (next !== "active") return;

        const since = backgroundedAt.current;
        backgroundedAt.current = null;
        if (since == null) return;
        if (Date.now() - since < AD_CAPS.appOpen.backgroundThresholdMs) {
          return;
        }

        void (async () => {
          if (!isAdsSdkReady()) return;
          if (!(await shouldShowAppOpen())) return;
          if (showAppOpenIfReady()) await recordAppOpenShown();
        })();
      },
    );

    return () => sub.remove();
  }, [enabled]);
}
