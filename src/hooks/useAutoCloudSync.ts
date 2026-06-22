import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { maybeAutoSyncToCloud } from "@/lib/auto-cloud-sync";
import { hasCloudSubscription } from "@/lib/storage-mode";

/** Cadangkan otomatis saat app aktif kembali (Pro + pengaturan aktif). */
export function useAutoCloudSync(enabled: boolean) {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!enabled) return;

    void maybeAutoSyncToCloud();

    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        next === "active"
      ) {
        void maybeAutoSyncToCloud();
      }
      appState.current = next;
    });

    return () => sub.remove();
  }, [enabled]);
}

export async function shouldRunAutoCloudSync(): Promise<boolean> {
  return hasCloudSubscription();
}
