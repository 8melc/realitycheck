export type NudgeType = 'session_limit' | 'goal_drift' | 'daily_checkin';
export type GuideTone = 'Soft Touch' | 'Straight' | 'Hard Truth';
export type ActionTaken = 'dismissed' | 'snoozed' | 'halt_die_fresse' | 'engaged';

export interface NudgeTrigger {
  type: NudgeType;
  shouldTrigger: boolean;
  context: {
    duration?: number;
    limit?: number;
    remaining?: number;
    daysSinceGoal?: number;
    goal?: string;
  };
}

export interface NudgeData {
  id: string;
  type: NudgeType;
  message: string;
  cta: string;
  dismissible: boolean;
  meta?: Record<string, any>;
}

export interface UserNudgeProfile {
  userId: string;
  name: string;
  goal: string;
  guideTone: GuideTone;
  interests: string[];
  currentDuration: number;
  dailyLimit: number;
  daysSinceLastGoalActivity: number;
}

