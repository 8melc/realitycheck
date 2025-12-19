/**
 * Feedback utilities for the FYF Guide
 * - Logs user feedback (more/less/stumm/tone) to guide_feedback
 * - Merges feedback into guide_settings on user_profiles without clobbering existing settings
 */

type FeedbackType = 'more' | 'less' | 'stumm' | 'tone_soft' | 'tone_direkt';

type FeedbackPayload = {
  type: FeedbackType;
  cluster?: string | null;
  itemId?: string | null;
};

type GuideSettings = {
  avoid_clusters?: string[];
  prefer_clusters?: string[];
  tone_preference?: 'tone_soft' | 'tone_direkt';
  no_content?: boolean;
};

const uniqueAppend = (arr: string[] = [], value?: string | null) => {
  if (!value) return arr;
  return Array.from(new Set([...arr, value]));
};

/**
 * Log feedback and merge guide settings.
 * @param supabase Supabase client (server-side)
 * @param userId Authenticated user id
 * @param feedback Feedback payload
 */
export const logFeedback = async (
  supabase: any,
  userId: string,
  feedback: FeedbackPayload
) => {
  // 1) Write feedback event
  await supabase.from('guide_feedback').insert({
    user_id: userId,
    feedback_type: feedback.type,
    cluster: feedback.cluster ?? null,
    item_id: feedback.itemId ?? null,
  });

  // 2) Fetch current guide_settings
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('guide_settings')
    .eq('user_id', userId)
    .maybeSingle();

  const current: GuideSettings = profile?.guide_settings || {};
  const next: GuideSettings = { ...current };

  // 3) Merge changes based on feedback type
  if (feedback.type === 'less') {
    next.avoid_clusters = uniqueAppend(current.avoid_clusters, feedback.cluster);
  }

  if (feedback.type === 'more') {
    next.prefer_clusters = uniqueAppend(current.prefer_clusters, feedback.cluster);
  }

  if (feedback.type === 'stumm') {
    next.no_content = true;
  }

  if (feedback.type === 'tone_soft' || feedback.type === 'tone_direkt') {
    next.tone_preference = feedback.type;
  }

  // 4) Persist merged settings
  await supabase
    .from('user_profiles')
    .update({ guide_settings: next })
    .eq('user_id', userId);

  return { ok: true };
};
