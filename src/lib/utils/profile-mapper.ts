import type { UserProfile } from '@/lib/types/database.types';
import type { Profile } from '@/types/profile';

/**
 * Maps Supabase UserProfile to legacy Profile type for backward compatibility
 */
export function mapUserProfileToLegacyProfile(
  supabaseProfile: UserProfile,
  goalText?: string | null
): Partial<Profile> {
  return {
    id: supabaseProfile.user_id || supabaseProfile.id, // Use user_id as primary identifier
    identity: {
      name: supabaseProfile.display_name || 'User',
      email: '', // Not in user_profiles table
      birthdate: supabaseProfile.birth_date || '',
      targetAge: supabaseProfile.target_age || 80,
    },
    goal: {
      text: goalText || 'Noch keines gesetzt',
      source: 'custom',
      createdAt: supabaseProfile.created_at,
      updatedAt: supabaseProfile.updated_at,
    },
    bio: supabaseProfile.bio || undefined,
    focusTopic: supabaseProfile.focus_topic || undefined,
    willLearn: supabaseProfile.will_learn || undefined,
    willShare: supabaseProfile.will_share || undefined,
    isPublic: supabaseProfile.is_public ?? true,
    primaryGoalTitle: goalText || undefined,
    createdAt: supabaseProfile.created_at,
    updatedAt: supabaseProfile.updated_at,
  };
}

