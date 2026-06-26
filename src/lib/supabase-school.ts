import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { config } from "@/lib/config";

const SUPABASE_FETCH_TIMEOUT_MS = 20_000;

async function supabaseFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SUPABASE_FETCH_TIMEOUT_MS);
  const upstreamSignal = init?.signal;
  const onUpstreamAbort = () => controller.abort();
  upstreamSignal?.addEventListener("abort", onUpstreamAbort);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
    upstreamSignal?.removeEventListener("abort", onUpstreamAbort);
  }
}

/** Klien Supabase sekolah legacy (tidak dipakai di rilis saat ini). */
export const schoolSupabase = createClient(
  config.schoolSupabaseUrl,
  config.schoolSupabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: supabaseFetch,
    },
  },
);
