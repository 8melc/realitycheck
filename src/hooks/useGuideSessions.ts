import { useState, useEffect, useCallback } from 'react';

export interface GuideSession {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export const useGuideSessions = () => {
  const [sessions, setSessions] = useState<GuideSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const response = await fetch('/api/guide/sessions');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('[useGuideSessions] Error:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    isLoading,
    isError,
    reload: fetchSessions,
  };
};

