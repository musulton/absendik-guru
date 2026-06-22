type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

const store = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

export function cacheKey(parts: (string | number | boolean | null | undefined)[]): string {
  return parts.map((part) => String(part ?? "")).join(":");
}

export function readFetchCache<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function writeFetchCache<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function invalidateFetchCache(prefix?: string): void {
  if (!prefix) {
    store.clear();
    inflight.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
  for (const key of inflight.keys()) {
    if (key.startsWith(prefix)) inflight.delete(key);
  }
}

export function clearFetchCache(): void {
  invalidateFetchCache();
}

type CachedFetchOptions = {
  force?: boolean;
};

/** Cache in-memory dengan deduplikasi request paralel. */
export async function cachedFetch<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
  options?: CachedFetchOptions,
): Promise<T> {
  if (!options?.force) {
    const cached = readFetchCache<T>(key);
    if (cached !== null) return cached;
  } else {
    inflight.delete(key);
  }

  if (!options?.force) {
    const pending = inflight.get(key);
    if (pending) return pending as Promise<T>;
  }

  const promise = fetcher()
    .then((value) => {
      writeFetchCache(key, value, ttlMs);
      inflight.delete(key);
      return value;
    })
    .catch((error) => {
      inflight.delete(key);
      throw error;
    });

  inflight.set(key, promise);
  return promise;
}
