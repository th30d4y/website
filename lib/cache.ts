interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  cachedAt: number;
}

// Primary cache — respects TTL
const cache = new Map<string, CacheEntry<unknown>>();

// Stale store — fallback when rate-limited; expires after MAX_STALE_MS
const staleStore = new Map<string, CacheEntry<unknown>>();

const MAX_STALE_MS = 60 * 60 * 1000; // 1 hour max stale age

export function setCache<T>(key: string, data: T, ttlMs: number): void {
  const entry: CacheEntry<T> = {
    data,
    expiresAt: Date.now() + ttlMs,
    cachedAt: Date.now(),
  };
  cache.set(key, entry as CacheEntry<unknown>);
  staleStore.set(key, entry as CacheEntry<unknown>);
}

/** Returns data only if still fresh (not expired). */
export function getCache<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

/**
 * Returns stale data as a last-resort fallback when rate-limited.
 * Ignores entries older than MAX_STALE_MS so they don't block fresh data.
 */
export function getStaleCache<T>(key: string): { data: T; stale: boolean; ageMs: number } | null {
  const entry = staleStore.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  const ageMs = Date.now() - entry.cachedAt;
  if (ageMs > MAX_STALE_MS) {
    staleStore.delete(key);
    return null;
  }
  return {
    data: entry.data,
    stale: Date.now() > entry.expiresAt,
    ageMs,
  };
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) cache.delete(key);
  }
}

/** Invalidates both fresh cache and stale store for a specific key. */
export function invalidateFull(key: string): void {
  cache.delete(key);
  staleStore.delete(key);
}

export function getCacheAge(key: string): number | null {
  const entry = cache.get(key);
  if (!entry) return null;
  return entry.expiresAt - Date.now();
}

// ── TTL constants ─────────────────────────────────────────────────────────────
// Volatile data TTLs are set shorter than the 5-minute auto-refresh interval
// so each interval tick fetches fresh data from GitHub.
export const TTL = {
  USER:         5 * 60 * 1000,   //  5 min
  REPOS:        4 * 60 * 1000,   //  4 min  (< 5-min refresh interval)
  COMMITS:      4 * 60 * 1000,   //  4 min
  LANGUAGES:    20 * 60 * 1000,  // 20 min  (stable data)
  CONTRIBUTORS: 10 * 60 * 1000,  // 10 min
  README:       30 * 60 * 1000,  // 30 min
  TREE:         30 * 60 * 1000,  // 30 min
  ISSUES:       3 * 60 * 1000,   //  3 min  (< 5-min refresh)
  PULLS:        3 * 60 * 1000,   //  3 min
  ORG:          5 * 60 * 1000,   //  5 min
  MEMBERS:      10 * 60 * 1000,  // 10 min
  EVENTS:       3 * 60 * 1000,   //  3 min
};
