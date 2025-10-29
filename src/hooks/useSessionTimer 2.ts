import { useState, useEffect, useRef, useCallback } from 'react';
import { useSessionHeartbeat } from '@/stores/usageStore';

interface UseSessionTimerProps {
  limitMinutes: number | null;
  onWarning80: () => void;
  onWarning95: () => void;
  onLimitReached: () => void;
}

interface SessionTimerState {
  elapsedMinutes: number;
  remainingMinutes: number;
  limitReached: boolean;
  isActive: boolean;
  sessionId: string;
}

export const useSessionTimer = ({
  limitMinutes,
  onWarning80,
  onWarning95,
  onLimitReached,
}: UseSessionTimerProps) => {
  const [state, setState] = useState<SessionTimerState>({
    elapsedMinutes: 0,
    remainingMinutes: limitMinutes || 0,
    limitReached: false,
    isActive: false,
    sessionId: '',
  });

  const { sendHeartbeat } = useSessionHeartbeat();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastHeartbeatRef = useRef<number>(0);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const warning80SentRef = useRef<boolean>(false);
  const warning95SentRef = useRef<boolean>(false);
  const sessionIdRef = useRef<string>('');

  // Generate unique session ID
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Format minutes to MM:SS
  const formatTime = useCallback((minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}`;
  }, []);

  // Send heartbeat to backend
  const sendHeartbeatToBackend = useCallback(async (consumedMinutes: number) => {
    try {
      const response = await sendHeartbeat(sessionIdRef.current, consumedMinutes);
      
      if (response.limitReached && !state.limitReached) {
        setState(prev => ({ ...prev, limitReached: true, isActive: false }));
        onLimitReached();
      }
    } catch (error) {
      console.error('Heartbeat failed:', error);
    }
  }, [sendHeartbeat, state.limitReached, onLimitReached]);

  // Broadcast to other tabs
  const broadcastToOtherTabs = useCallback((data: any) => {
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage(data);
    }
  }, []);

  // Handle page visibility change
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // Page is hidden, pause timer
      setState(prev => ({ ...prev, isActive: false }));
    } else {
      // Page is visible, resume timer
      setState(prev => ({ ...prev, isActive: true }));
      startTimeRef.current = Date.now() - (state.elapsedMinutes * 60 * 1000);
    }
  }, [state.elapsedMinutes]);

  // Check warning thresholds
  const checkWarningThresholds = useCallback((elapsed: number) => {
    if (!limitMinutes) return;

    const percentage = (elapsed / limitMinutes) * 100;

    if (percentage >= 80 && !warning80SentRef.current) {
      warning80SentRef.current = true;
      onWarning80();
    }

    if (percentage >= 95 && !warning95SentRef.current) {
      warning95SentRef.current = true;
      onWarning95();
    }
  }, [limitMinutes, onWarning80, onWarning95]);

  // Main timer tick
  const tick = useCallback(() => {
    if (!state.isActive || state.limitReached) return;

    const now = Date.now();
    const elapsedMs = now - startTimeRef.current;
    const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));

    setState(prev => {
      const remaining = limitMinutes ? Math.max(0, limitMinutes - elapsedMinutes) : 0;
      const limitReached = limitMinutes ? elapsedMinutes >= limitMinutes : false;

      return {
        ...prev,
        elapsedMinutes,
        remainingMinutes: remaining,
        limitReached,
      };
    });

    // Check warning thresholds
    checkWarningThresholds(elapsedMinutes);

    // Send heartbeat every 30 seconds
    if (now - lastHeartbeatRef.current >= 30000) {
      lastHeartbeatRef.current = now;
      sendHeartbeatToBackend(elapsedMinutes);
    }

    // Broadcast to other tabs
    broadcastToOtherTabs({
      type: 'usageUpdate',
      elapsedMinutes,
      remainingMinutes: limitMinutes ? Math.max(0, limitMinutes - elapsedMinutes) : 0,
      limitReached: limitMinutes ? elapsedMinutes >= limitMinutes : false,
    });
  }, [state.isActive, state.limitReached, limitMinutes, checkWarningThresholds, sendHeartbeatToBackend, broadcastToOtherTabs]);

  // Start timer
  const startTimer = useCallback(() => {
    if (sessionIdRef.current) return; // Already started

    const sessionId = generateSessionId();
    sessionIdRef.current = sessionId;
    startTimeRef.current = Date.now();
    lastHeartbeatRef.current = Date.now();

    setState(prev => ({
      ...prev,
      sessionId,
      isActive: true,
      elapsedMinutes: 0,
      remainingMinutes: limitMinutes || 0,
      limitReached: false,
    }));

    // Reset warning flags
    warning80SentRef.current = false;
    warning95SentRef.current = false;

    // Start interval
    intervalRef.current = setInterval(tick, 1000); // Update every second

    // Send initial heartbeat after state is set
    setTimeout(() => {
      sendHeartbeatToBackend(0);
    }, 0);
  }, [limitMinutes, generateSessionId, tick, sendHeartbeatToBackend]);

  // Stop timer
  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isActive: false,
    }));
  }, []);

  // Reset timer
  const resetTimer = useCallback(() => {
    stopTimer();
    sessionIdRef.current = '';
    setState(prev => ({
      ...prev,
      sessionId: '',
      elapsedMinutes: 0,
      remainingMinutes: limitMinutes || 0,
      limitReached: false,
    }));
    warning80SentRef.current = false;
    warning95SentRef.current = false;
  }, [stopTimer, limitMinutes]);

  // Initialize
  useEffect(() => {
    // Set up page visibility listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up broadcast channel for multi-tab sync
    if (typeof BroadcastChannel !== 'undefined') {
      broadcastChannelRef.current = new BroadcastChannel('fyf-session-timer');
      
      broadcastChannelRef.current.onmessage = (event) => {
        const { type, elapsedMinutes, remainingMinutes, limitReached } = event.data;
        
        if (type === 'usageUpdate') {
          setState(prev => ({
            ...prev,
            elapsedMinutes,
            remainingMinutes,
            limitReached,
          }));
        }
      };
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [handleVisibilityChange]);

  // Update remaining minutes when limit changes
  useEffect(() => {
    if (limitMinutes !== null) {
      setState(prev => ({
        ...prev,
        remainingMinutes: Math.max(0, limitMinutes - prev.elapsedMinutes),
      }));
    }
  }, [limitMinutes]);

  return {
    // State
    elapsedMinutes: state.elapsedMinutes,
    remainingMinutes: state.remainingMinutes,
    limitReached: state.limitReached,
    isActive: state.isActive,
    sessionId: state.sessionId,
    
    // Formatted time
    elapsedTimeFormatted: formatTime(state.elapsedMinutes),
    remainingTimeFormatted: formatTime(state.remainingMinutes),
    
    // Actions
    startTimer,
    stopTimer,
    resetTimer,
  };
};
