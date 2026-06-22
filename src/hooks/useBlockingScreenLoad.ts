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

/**
 * State loading fetch — default true agar tidak flash konten kosong
 * saat API timeout lalu fallback Supabase.
 */
export function useFetchLoadingState(initial = true) {
  return useState(initial);
}

/** Apakah fetch ini perlu flag loading (workspace sekolah, bukan refresh diam-diam). */
export function shouldShowFetchLoading(
  isSchoolWorkspace: boolean,
  silent?: boolean,
): boolean {
  return !silent && isSchoolWorkspace;
}
