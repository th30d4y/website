interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

export function setCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

export function getCacheAge(key: string): number | null {
  const entry = cache.get(key);
  if (!entry) return null;
  return entry.expiresAt - Date.now();
}

// TTL constants
export const TTL = {
  USER: 5 * 60 * 1000,        // 5 minutes
  REPOS: 5 * 60 * 1000,       // 5 minutes
  COMMITS: 3 * 60 * 1000,     // 3 minutes
  LANGUAGES: 10 * 60 * 1000,  // 10 minutes
  CONTRIBUTORS: 10 * 60 * 1000,
  README: 15 * 60 * 1000,     // 15 minutes
  TREE: 15 * 60 * 1000,
  ISSUES: 5 * 60 * 1000,
  PULLS: 5 * 60 * 1000,
};
