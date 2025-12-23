import type { UserNudgeProfile, GuideTone } from './types';

/**
 * Normalize guide tone from database to our type
 */
export function normalizeGuideTone(tone: string | null | undefined): GuideTone {
  if (!tone) return 'Straight';
  
  const normalized = tone.trim();
  if (normalized === 'Soft Touch' || normalized === 'soft_touch' || normalized === 'soft') {
    return 'Soft Touch';
  }
  if (normalized === 'Hard Truth' || normalized === 'hard_truth' || normalized === 'hard') {
    return 'Hard Truth';
  }
  return 'Straight';
}

/**
 * Get user profile data for nudge generation
 */
export async function getUserNudgeProfile(
  supabase: any,
  userId: string,
  triggerContext: any
): Promise<UserNudgeProfile | null> {
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('display_name, guide_tone, daily_time_limit_minutes, focus_topic, will_learn')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !profile) {
    console.error('[Nudge] Error fetching user profile:', error);
    return null;
  }

  // Get primary goal
  const { data: goal } = await supabase
    .from('user_goals')
    .select('title')
    .eq('user_id', userId)
    .eq('is_primary', true)
    .maybeSingle();

  // Calculate days since last goal activity (simplified for MVP)
  const daysSinceLastGoalActivity = 0; // TODO: Implement actual calculation

  return {
    userId,
    name: profile.display_name || 'du',
    goal: goal?.title || 'bewusster leben',
    guideTone: normalizeGuideTone(profile.guide_tone),
    interests: profile.will_learn || [],
    currentDuration: triggerContext.duration || 0,
    dailyLimit: profile.daily_time_limit_minutes || 60,
    daysSinceLastGoalActivity,
  };
}


