interface DemoUsageState {
  dailyLimitMinutes: number | null;
  lastLimitUpdateAt: string | null;
  requiresReauth: boolean;
  sessionUsage: Record<string, {
    userId: string;
    consumedMinutes: number;
    startedAt: string;
    updatedAt: string;
    limitReachedAt: string | null;
  }>;
  updatedAt: string;
}

interface SessionSummary {
  todayUsageMinutes: number;
  limitReached: boolean;
  shouldLogout: boolean;
  consumedMinutes: number;
}

// Extend globalThis for server-side state persistence
declare global {
  var __demoUsageState: DemoUsageState | undefined;
}

class DemoUsageService {
  private static instance: DemoUsageService;
  private state: DemoUsageState;
  private storageKey = 'fyf-demo-usage';
  private storageAvailable: boolean;

  private constructor() {
    this.storageAvailable = this.checkStorageAvailability();
    this.state = this.loadFromStorage();
  }

  public static getInstance(): DemoUsageService {
    if (!DemoUsageService.instance) {
      DemoUsageService.instance = new DemoUsageService();
    }
    return DemoUsageService.instance;
  }

  private checkStorageAvailability(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.localStorage !== 'undefined' && 
           window.localStorage !== null;
  }

  private loadFromStorage(): DemoUsageState {
    if (this.storageAvailable) {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (error) {
        console.warn('Failed to load demo usage data from localStorage:', error);
      }
    }

    // Check global state for server-side persistence
    if (typeof globalThis !== 'undefined' && globalThis.__demoUsageState) {
      return globalThis.__demoUsageState;
    }

    // Default state
    const defaultState = {
      dailyLimitMinutes: null,
      lastLimitUpdateAt: null,
      requiresReauth: false,
      sessionUsage: {},
      updatedAt: new Date().toISOString(),
    };

    // Store in global state for server-side persistence
    if (typeof globalThis !== 'undefined') {
      globalThis.__demoUsageState = defaultState;
    }

    return defaultState;
  }

  private saveToStorage(): void {
    this.state.updatedAt = new Date().toISOString();
    
    if (this.storageAvailable) {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      } catch (error) {
        console.warn('Failed to save demo usage data to localStorage:', error);
      }
    }

    // Always update global state for server-side persistence
    if (typeof globalThis !== 'undefined') {
      globalThis.__demoUsageState = this.state;
    }
  }

  public getUserState(userId: string): DemoUsageState {
    return { ...this.state };
  }

  public updateUserState(userId: string, partial: Partial<DemoUsageState>): void {
    this.state = {
      ...this.state,
      ...partial,
    };
    this.saveToStorage();
  }

  public upsertSessionUsage({
    sessionId,
    userId,
    consumedMinutes,
    timestamp,
  }: {
    sessionId: string;
    userId: string;
    consumedMinutes: number;
    timestamp: Date;
  }): SessionSummary {
    const now = timestamp.toISOString();
    
    // Update or create session
    this.state.sessionUsage[sessionId] = {
      userId,
      consumedMinutes,
      startedAt: this.state.sessionUsage[sessionId]?.startedAt || now,
      updatedAt: now,
      limitReachedAt: this.state.sessionUsage[sessionId]?.limitReachedAt || null,
    };

    // Calculate today's total usage
    const today = new Date().toISOString().split('T')[0];
    const todayUsageMinutes = Object.values(this.state.sessionUsage)
      .filter(session => session.userId === userId)
      .filter(session => session.startedAt.startsWith(today))
      .reduce((total, session) => total + session.consumedMinutes, 0);

    // Check if limit is reached
    const limitReached = this.state.dailyLimitMinutes 
      ? todayUsageMinutes >= this.state.dailyLimitMinutes 
      : false;

    // Mark limit reached timestamp if just reached
    if (limitReached && !this.state.sessionUsage[sessionId].limitReachedAt) {
      this.state.sessionUsage[sessionId].limitReachedAt = now;
    }

    this.saveToStorage();

    return {
      todayUsageMinutes,
      limitReached,
      shouldLogout: limitReached,
      consumedMinutes: todayUsageMinutes,
    };
  }

  public resetSessionUsage(userId: string): void {
    // Remove all sessions for this user
    Object.keys(this.state.sessionUsage).forEach(sessionId => {
      if (this.state.sessionUsage[sessionId].userId === userId) {
        delete this.state.sessionUsage[sessionId];
      }
    });
    this.saveToStorage();
  }

  public calculateTodayUsage(userId: string): number {
    const today = new Date().toISOString().split('T')[0];
    return Object.values(this.state.sessionUsage)
      .filter(session => session.userId === userId)
      .filter(session => session.startedAt.startsWith(today))
      .reduce((total, session) => total + session.consumedMinutes, 0);
  }
}

export { DemoUsageService };
export type { DemoUsageState, SessionSummary };
