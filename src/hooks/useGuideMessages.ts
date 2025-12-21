import { useState, useEffect, useCallback } from 'react';

export interface GuideMessage {
  id: string;
  role: 'user' | 'guide';
  message: string;
  created_at: string;
}

export const useGuideMessages = (sessionId?: string) => {
  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      const response = await fetch(`/api/guide/messages?sessionId=${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('[useGuideMessages] Error:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    isLoading,
    isError,
    reload: fetchMessages,
  };
};

