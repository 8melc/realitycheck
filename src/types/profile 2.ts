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
  createdAt: string;
  updatedAt: string;
}

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
