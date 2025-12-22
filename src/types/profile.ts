export type GuideStatus = 'sparflamme' | 'warming-up' | 'on-track' | 'on-fire';

export type FeedbackTone = 'motivating' | 'challenging' | 'reflecting';

export interface Profile {
  id: string;
  identity: {
    name: string;
    email: string;
    avatarUrl?: string;
    birthdate: string;
    targetAge: number;
  };
  goal: {
    text: string;
    source: 'chip' | 'custom';
    createdAt: string;
    updatedAt: string;
  };
  timePhilosophy: {
    optionId: string;
    label: string;
    selectedAt: string;
  };
  lifestyle: {
    optionId: string;
    label: string;
    selectedAt: string;
  };
  interests: Array<{
    id: string;
    label: string;
    icon?: string;
    weight?: number;
  }>;
  projects?: Array<{
    id: string;
    title: string;
    status: 'active' | 'paused' | 'completed';
    description?: string;
    updatedAt: string;
  }>;
  musicDNA: {
    genres: string[];
    spotifyLinked: boolean;
    spotifyData?: {
      topArtists: string[];
      topGenres: string[];
      playlistId?: string;
      linkedAt: string;
    };
  };
  progress: {
    guideStatus: GuideStatus;
    actionCount: number;
    streak: number;
    lastAction: string;
  };
  journey: Array<{
    id: string;
    type: 'onboarding' | 'life-in-weeks' | 'people' | 'guide-action' | 'review';
    description: string;
    timestamp: string;
  }>;
  feedback: Array<{
    id: string;
    tone: FeedbackTone;
    message: string;
    createdAt: string;
  }>;
  matching?: {
    compatibilityScore: number;
    matches: Array<{
      userId: string;
      name: string;
      score: number;
      sharedInterests: string[];
      sharedMusicGenres: string[];
    }>;
  };
  usageLimit?: {
    dailyLimitMinutes: number | null;
    todayUsageMinutes: number;
    requiresReauth: boolean;
    lastLimitUpdateAt: string | null;
    limitReached: boolean;
  };
  bio?: string;
  focusTopic?: string;
  willLearn?: string[];
  willShare?: string[];
  isPublic?: boolean;
  primaryGoalTitle?: string; // Source: user_goals table
  createdAt: string;
  updatedAt: string;
}

// --- NEUE TYPEN FÜR PHASE 2 ---

// Komplettes User-Profil mit allen Feldern aus der DB
export interface UserProfile {
  user_id: string;
  display_name: string;
  birth_date: string;
  target_age: number;
  guide_personality: string;
  bio?: string;
  focus_topic?: string;
  will_learn?: string[];
  will_share?: string[];
  is_public: boolean;
  avatar_url?: string;
  goal_direction?: 'freedom' | 'clarity' | 'growth' | 'balance' | 'meaning' | null;
  created_at?: string;
}

// Profil mit Primary Goal (für Detailseite)
export interface ProfileWithGoal extends UserProfile {
  primary_goal?: {
    id: string;
    title: string;
    status: string;
  } | null;
}

// Zeit-Berechnungen für Profil
export interface ProfileTimeStats {
  weeksLived: number;
  weeksRemaining: number;
  percentageLived: number;
  yearsLived: number;
  yearsRemaining: number;
}

// Helper: Berechne Zeit-Stats aus Profil
export function calculateTimeStats(profile: UserProfile): ProfileTimeStats {
  const birthDate = new Date(profile.birth_date);
  const today = new Date();
  const targetDate = new Date(birthDate);
  targetDate.setFullYear(birthDate.getFullYear() + profile.target_age);

  const msPerWeek = 1000 * 60 * 60 * 24 * 7;
  const totalWeeks = Math.floor((targetDate.getTime() - birthDate.getTime()) / msPerWeek);
  const weeksLived = Math.floor((today.getTime() - birthDate.getTime()) / msPerWeek);
  const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
  const percentageLived = Math.min(100, Math.round((weeksLived / totalWeeks) * 100));

  const msPerYear = 1000 * 60 * 60 * 24 * 365.25;
  const yearsLived = Math.floor((today.getTime() - birthDate.getTime()) / msPerYear);
  const yearsRemaining = Math.max(0, profile.target_age - yearsLived);

  return {
    weeksLived,
    weeksRemaining,
    percentageLived,
    yearsLived,
    yearsRemaining
  };
}

// --- EXISTIERENDE HILFSTYPEN ---

export interface SessionUsage {
  id: string;
  userId: string;
  sessionId: string;
  startedAt: string;
  lastActivityAt: string;
  consumedMinutes: number;
  limitReachedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UsageLimitResponse {
  dailyLimitMinutes: number | null;
  todayUsageMinutes: number;
  requiresReauth: boolean;
  lastLimitUpdateAt: string | null;
  limitReached: boolean;
}

export interface SessionHeartbeatResponse {
  consumedMinutes: number;
  limitReached: boolean;
  shouldLogout: boolean;
}
