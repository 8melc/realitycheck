import type { UserProfile } from '@/lib/types/database.types';
import type { Profile } from '@/types/profile';

/**
 * Maps Supabase UserProfile to legacy Profile type for backward compatibility
 */
/**
 * Maps Supabase UserProfile to legacy Profile type for backward compatibility
 * 
 * IMPORTANT: No fallbacks/defaults here - if a field is missing, it means the API didn't set it.
 * This enforces the "single source of truth" principle.
 * 
 * @param supabaseProfile - User profile from database
 * @param goalText - Primary goal title (optional, from user_goals join)
 */
export function mapUserProfileToLegacyProfile(
  supabaseProfile: UserProfile,
  goalText?: string | null
): Partial<Profile> {
  return {
    id: supabaseProfile.user_id || supabaseProfile.id, // Use user_id as primary identifier
    identity: {
      name: supabaseProfile.display_name ?? '', // No fallback - must be set by onboarding API
      email: '', // Not in user_profiles table
      birthdate: supabaseProfile.birth_date ?? '', // No fallback - must be set by onboarding API
      targetAge: supabaseProfile.target_age ?? 0, // No fallback - must be set by onboarding API
    },
    goal: {
      text: goalText ?? '', // No fallback - empty string if not set
      source: 'custom',
      createdAt: supabaseProfile.created_at,
      updatedAt: supabaseProfile.updated_at,
    },
    bio: supabaseProfile.bio ?? undefined, // Explicitly undefined if not set
    focusTopic: supabaseProfile.focus_topic ?? undefined,
    willLearn: supabaseProfile.will_learn ?? undefined,
    willShare: supabaseProfile.will_share ?? undefined,
    isPublic: supabaseProfile.is_public ?? false, // Default to false (private)
    primaryGoalTitle: goalText ?? undefined,
    createdAt: supabaseProfile.created_at,
    updatedAt: supabaseProfile.updated_at,
  };
}

