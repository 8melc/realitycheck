import { create } from 'zustand';
import { UsageLimitResponse, SessionHeartbeatResponse } from '@/types/profile';

interface UsageState {
  // State
  dailyLimitMinutes: number | null;
  todayUsageMinutes: number;
  requiresReauth: boolean;
  limitReached: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setLimit: (minutes: number | null) => Promise<boolean>;
  fetchUsageData: () => Promise<void>;
  updateUsage: (minutes: number) => void;
  clearError: () => void;
  resetReauth: () => void;
  ensureUsageLoaded: () => Promise<void>;
}

export const useUsageStore = create<UsageState>((set, get) => ({
  // Initial state
  dailyLimitMinutes: null,
  todayUsageMinutes: 0,
  requiresReauth: false,
  limitReached: false,
  isLoading: false,
  error: null,

  // Set daily usage limit
  setLimit: async (minutes: number | null): Promise<boolean> => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/profile/usage-limit', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dailyLimitMinutes: minutes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set usage limit');
      }

      const data: UsageLimitResponse = await response.json();
      
      set({
        dailyLimitMinutes: data.dailyLimitMinutes,
        todayUsageMinutes: data.todayUsageMinutes,
        requiresReauth: data.requiresReauth,
        limitReached: data.limitReached,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      return false;
    }
  },

  // Fetch current usage data
  fetchUsageData: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('/api/profile/usage-limit');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch usage data');
      }

      const data: UsageLimitResponse = await response.json();
      
      set({
        dailyLimitMinutes: data.dailyLimitMinutes,
        todayUsageMinutes: data.todayUsageMinutes,
        requiresReauth: data.requiresReauth,
        limitReached: data.limitReached,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  },

  // Update usage (called by session timer)
  updateUsage: (minutes: number) => {
    set((state) => {
      const newTodayUsage = minutes;
      const limitReached = state.dailyLimitMinutes 
        ? newTodayUsage >= state.dailyLimitMinutes 
        : false;

      return {
        todayUsageMinutes: newTodayUsage,
        limitReached,
      };
    });
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },

  // Reset reauth requirement (called after successful login)
  resetReauth: () => {
    set({ requiresReauth: false });
  },

  // Ensure usage data is loaded
  ensureUsageLoaded: async () => {
    const state = get();
    if (state.dailyLimitMinutes === null && !state.isLoading) {
      await state.fetchUsageData();
    }
  },
}));

// Helper hook for session heartbeat
export const useSessionHeartbeat = () => {
  const updateUsage = useUsageStore((state) => state.updateUsage);
  
  const sendHeartbeat = async (sessionId: string, consumedMinutes: number): Promise<SessionHeartbeatResponse> => {
    try {
      const response = await fetch('/api/session/usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          consumedMinutes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send heartbeat');
      }

      const data: SessionHeartbeatResponse = await response.json();
      
      // Update local state
      updateUsage(data.consumedMinutes);
      
      return data;
    } catch (error) {
      console.error('Heartbeat error:', error);
      throw error;
    }
  };

  return { sendHeartbeat };
};
