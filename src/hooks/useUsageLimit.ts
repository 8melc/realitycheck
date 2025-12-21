import { useState, useEffect, useCallback, useRef } from 'react';
import { UsageLimitResponse } from '@/types/profile';

interface UseUsageLimitReturn {
  dailyLimitMinutes: number | null;
  todayUsageMinutes: number;
  limitReached: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const REFETCH_INTERVAL_MS = 60 * 1000; // Max alle 60 Sekunden
const MIN_FETCH_INTERVAL_MS = 30 * 1000; // Minimum 30 Sekunden zwischen Calls

/**
 * Hook to fetch and manage usage limit data
 * Calls GET /api/profile/usage-limit
 * Rate-limited: Max alle 60 Sekunden, Minimum 30 Sekunden zwischen Calls
 */
export function useUsageLimit(): UseUsageLimitReturn {
  const [dailyLimitMinutes, setDailyLimitMinutes] = useState<number | null>(null);
  const [todayUsageMinutes, setTodayUsageMinutes] = useState<number>(0);
  const [limitReached, setLimitReached] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const lastFetchRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUsageData = useCallback(async (force = false) => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchRef.current;

    // Rate-Limiting: Nur fetchen wenn:
    // - force = true (manueller refetch)
    // - ODER mindestens MIN_FETCH_INTERVAL_MS seit letztem Fetch vergangen
    if (!force && timeSinceLastFetch < MIN_FETCH_INTERVAL_MS) {
      return; // Skip, zu früh
    }

    // Verhindere parallele Requests
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    lastFetchRef.current = now;

    try {
      const response = await fetch('/api/profile/usage-limit');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch usage data');
      }

      const data: UsageLimitResponse = await response.json();

      setDailyLimitMinutes(data.dailyLimitMinutes);
      setTodayUsageMinutes(data.todayUsageMinutes);
      setLimitReached(data.limitReached);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      // Nur Errors loggen, nicht jeden erfolgreichen Call
      if (err instanceof Error) {
        console.error('[useUsageLimit] Error:', err.message);
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Initial fetch beim Mount
  useEffect(() => {
    fetchUsageData(true); // Force initial fetch
  }, []); // Nur einmal beim Mount

  // Auto-refetch alle REFETCH_INTERVAL_MS (60 Sekunden)
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchUsageData(false); // Rate-limited fetch
    }, REFETCH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchUsageData]);

  return {
    dailyLimitMinutes,
    todayUsageMinutes,
    limitReached,
    isLoading,
    error,
    refetch: () => fetchUsageData(true), // Force refetch bei manuellem Aufruf
  };
}
