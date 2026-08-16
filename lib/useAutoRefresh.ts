'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Calls `fetch(false)` immediately on mount (uses server cache),
 * then calls `fetch(true)` every `intervalMs` (bypasses cache, fetches fresh
 * data from GitHub via ?refresh=1).
 *
 * Also refreshes immediately when the tab becomes visible again if the last
 * refresh is older than `intervalMs`.
 */
export function useAutoRefresh(
  fetch: (force: boolean) => void,
  intervalMs: number
) {
  const fetchRef = useRef(fetch);
  const lastRefreshAt = useRef(0);

  useEffect(() => { fetchRef.current = fetch; }, [fetch]);

  const doRefresh = useCallback((force: boolean) => {
    lastRefreshAt.current = Date.now();
    fetchRef.current(force);
  }, []);

  useEffect(() => {
    // Initial load — use cache if available
    doRefresh(false);

    // Periodic interval — always bypass cache so new GitHub data appears
    const id = setInterval(() => doRefresh(true), intervalMs);

    // Re-fetch when tab becomes visible after being hidden
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        const stale = Date.now() - lastRefreshAt.current > intervalMs;
        if (stale) doRefresh(true);
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [doRefresh, intervalMs]);
}
