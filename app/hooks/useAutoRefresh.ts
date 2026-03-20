"use client";
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Auto-refresh hook — calls `fetcher` every `intervalMs` while the tab is visible.
 * Pauses when the tab is hidden to avoid wasting requests.
 *
 * Returns { lastUpdated, refresh, paused, setPaused }
 */
export function useAutoRefresh(
  fetcher: () => Promise<void>,
  intervalMs: number = 30_000
) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      await fetcher();
      setLastUpdated(new Date());
    } catch {
      // non-fatal — next tick will retry
    }
  }, [fetcher]);

  useEffect(() => {
    if (paused) return;

    // Start interval
    timerRef.current = setInterval(refresh, intervalMs);

    // Pause when tab is hidden
    const onVisibility = () => {
      if (document.hidden) {
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        refresh(); // immediate refresh on tab return
        timerRef.current = setInterval(refresh, intervalMs);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh, intervalMs, paused]);

  return { lastUpdated, refresh, paused, setPaused };
}
