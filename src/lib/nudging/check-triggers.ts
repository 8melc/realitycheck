import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { NudgeTrigger } from './types';

const MAX_NUDGES_PER_DAY = 2;
const SESSION_LIMIT_THRESHOLD = 0.7; // 70% des Limits

/**
 * Check if user should receive a nudge
 */
export async function checkNudgeTriggers(userId: string): Promise<NudgeTrigger | null> {
  const supabase = await createSupabaseServerClient();

  // 1. Check: Ist Nudging pausiert?
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('nudging_paused_until, nudging_frequency, daily_time_limit_minutes')
    .eq('user_id', userId)
    .maybeSingle();

  if (!profile) {
    return null;
  }

  // Check if nudging is paused
  if (profile.nudging_paused_until) {
    const pausedUntil = new Date(profile.nudging_paused_until);
    if (pausedUntil > new Date()) {
      return null; // Nudging is paused
    }
  }

  // 2. Check: Frequenz-Cap (max 2 Nudges/Tag)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('nudges_sent')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('shown_at', today.toISOString());

  if (count !== null && count >= MAX_NUDGES_PER_DAY) {
    return null; // Frequency cap reached
  }

  // 3. Prüfe Trigger-Bedingungen (MVP: nur session_limit)
  const sessionTrigger = await checkSessionLimit(
    supabase,
    userId,
    profile.daily_time_limit_minutes
  );
  
  if (sessionTrigger && sessionTrigger.shouldTrigger) {
    // Check if we already sent a session_limit nudge today
    const { count: sessionNudgeCount } = await supabase
      .from('nudges_sent')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('nudge_type', 'session_limit')
      .gte('shown_at', today.toISOString());

    if (sessionNudgeCount === 0) {
      return sessionTrigger;
    }
  }

  // Weitere Triggers hier (goal_drift, daily_checkin)...
  
  return null;
}

/**
 * Check session limit trigger (70% of daily limit)
 */
async function checkSessionLimit(
  supabase: any,
  userId: string,
  dailyLimit: number | null
): Promise<NudgeTrigger | null> {
  if (!dailyLimit) {
    return null;
  }

  // Get today's sessions
  const now = new Date();
  const todayStart = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );

  const { data: sessions, error } = await supabase
    .from('user_sessions')
    .select('duration_minutes')
    .eq('user_id', userId)
    .gte('session_start', todayStart.toISOString())
    .not('duration_minutes', 'is', null);

  if (error) {
    console.error('[Nudge] Error fetching sessions:', error);
    return null;
  }

  // Calculate total duration today
  const totalDurationToday =
    sessions?.reduce((sum: number, s: any) => sum + (s.duration_minutes || 0), 0) || 0;

  const threshold = Math.floor(dailyLimit * SESSION_LIMIT_THRESHOLD);
  const remaining = dailyLimit - totalDurationToday;

  // Check if threshold reached
  if (totalDurationToday >= threshold) {
    return {
      type: 'session_limit',
      shouldTrigger: true,
      context: {
        duration: totalDurationToday,
        limit: dailyLimit,
        remaining: Math.max(0, remaining),
      },
    };
  }

  return null;
}


