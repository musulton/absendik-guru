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

export const supabase = createClient(
  config.guruSupabaseUrl,
  config.guruSupabaseAnonKey,
  {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    // Refresh diatur lewat AppState (App.tsx) — hindari refresh paksa saat cold start offline.
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  global: {
    fetch: supabaseFetch,
  },
});
