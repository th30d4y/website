interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  cachedAt: number;
}

// Primary cache — respects TTL for fresh checks
const cache = new Map<string, CacheEntry<unknown>>();

// Permanent store — never auto-deleted; survives TTL expiry for stale serving
const staleStore = new Map<string, CacheEntry<unknown>>();

export function setCache<T>(key: string, data: T, ttlMs: number): void {
  const entry: CacheEntry<T> = {
    data,
    expiresAt: Date.now() + ttlMs,
    cachedAt: Date.now(),
  };
  cache.set(key, entry as CacheEntry<unknown>);
  staleStore.set(key, entry as CacheEntry<unknown>);
}

/** Returns fresh data only (not expired). Returns null if expired or missing. */
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
 * Returns data even if expired (stale). Use as fallback when the upstream
 * API is rate-limited. Returns null only if the key was never cached.
 */
export function getStaleCache<T>(key: string): { data: T; stale: boolean; ageMs: number } | null {
  const entry = staleStore.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  return {
    data: entry.data,
    stale: Date.now() > entry.expiresAt,
    ageMs: Date.now() - entry.cachedAt,
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

export function getCacheAge(key: string): number | null {
  const entry = cache.get(key);
  if (!entry) return null;
  return entry.expiresAt - Date.now();
}

// TTL constants — longer to survive hourly rate-limit resets
export const TTL = {
  USER: 10 * 60 * 1000,        // 10 minutes
  REPOS: 10 * 60 * 1000,       // 10 minutes
  COMMITS: 5 * 60 * 1000,      //  5 minutes
  LANGUAGES: 30 * 60 * 1000,   // 30 minutes
  CONTRIBUTORS: 30 * 60 * 1000,
  README: 60 * 60 * 1000,      // 60 minutes
  TREE: 60 * 60 * 1000,
  ISSUES: 5 * 60 * 1000,
  PULLS: 5 * 60 * 1000,
  ORG: 15 * 60 * 1000,
  MEMBERS: 30 * 60 * 1000,
  EVENTS: 5 * 60 * 1000,
};
