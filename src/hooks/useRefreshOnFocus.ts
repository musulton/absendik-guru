import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useRef } from "react";

type Options = {
  /** Lewati refetch jika data masih segar (default 45 detik). */
  staleMs?: number;
};

/**
 * Muat ulang data saat layar dapat fokus (mis. setelah kembali dari form simpan).
 * Lewati mount pertama dan refetch beruntun dalam `staleMs`.
 */
export function useRefreshOnFocus(
  refetch: () => void | Promise<void>,
  options?: Options,
) {
  const staleMs = options?.staleMs ?? 45_000;
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  const didMountRef = useRef(false);
  const lastFetchAtRef = useRef(0);

  useFocusEffect(
    useCallback(() => {
      if (!didMountRef.current) {
        didMountRef.current = true;
        lastFetchAtRef.current = Date.now();
        if (staleMs > 0) return;
      }
      const now = Date.now();
      if (now - lastFetchAtRef.current < staleMs) return;
      lastFetchAtRef.current = now;
      void refetchRef.current();
    }, [staleMs]),
  );
}
