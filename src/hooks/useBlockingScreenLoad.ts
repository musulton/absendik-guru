import { useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";

/** Spinner layar penuh — hanya workspace sekolah saat data belum ada. */
export function useBlockingScreenLoad(loading: boolean, hasData: boolean) {
  const { isSchoolWorkspace } = useWorkspace();
  return loading && !hasData && isSchoolWorkspace;
}

/** Overlay loading saat fetch ulang (ganti filter/tanggal) meski data lama masih ada. */
export function useSchoolFetchOverlay(loading: boolean) {
  const { isSchoolWorkspace } = useWorkspace();
  return loading && isSchoolWorkspace;
}

/** State loading fetch — sekolah set true saat fetch dimulai. */
export function useFetchLoadingState(initial = false) {
  return useState(initial);
}

/** Apakah fetch ini perlu flag loading (workspace sekolah, bukan refresh diam-diam). */
export function shouldShowFetchLoading(
  isSchoolWorkspace: boolean,
  silent?: boolean,
): boolean {
  return !silent && isSchoolWorkspace;
}

type ScreenFetchCleanupOpts = {
  isSchoolWorkspace: boolean;
  silent?: boolean;
  setLoading: (loading: boolean) => void;
  setRefreshing?: (refreshing: boolean) => void;
};

/** Pastikan spinner pull-to-refresh / loading selalu berhenti. */
export function finishScreenFetch(opts: ScreenFetchCleanupOpts): void {
  const showSpinner = shouldShowFetchLoading(opts.isSchoolWorkspace, opts.silent);
  if (showSpinner) opts.setLoading(false);
  opts.setRefreshing?.(false);
}
