'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Calls `refresh` immediately, then every `intervalMs` milliseconds.
 * Cleans up on unmount. Re-starts if `intervalMs` changes.
 */
export function useAutoRefresh(refresh: () => void, intervalMs: number) {
  const refreshRef = useRef(refresh);
  // Keep latest callback without restarting the interval
  useEffect(() => { refreshRef.current = refresh; }, [refresh]);

  useEffect(() => {
    // Initial fetch
    refreshRef.current();

    const id = setInterval(() => {
      refreshRef.current();
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs]);
}
