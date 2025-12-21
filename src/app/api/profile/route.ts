import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLifeInWeeksDataForUser } from '@/lib/domain/lifeInWeeks';
import type { UserProfile } from '@/lib/types/database.types';
import { mapUserProfileToLegacyProfile } from '@/lib/utils/profile-mapper';
import type { Profile } from '@/types/profile';

/**
 * GET /api/profile
 * Get current user's profile with life-in-weeks data
 * Returns both raw UserProfile and mapped Profile for backward compatibility
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile
    // WICHTIG: birth_date kann null sein (nullable in DB)
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle<UserProfile>();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    if (!profile) {
      // Profile not found - return 404
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Get primary goal if exists
    const { data: primaryGoal } = await supabase
      .from('user_goals')
      .select('title')
      .eq('user_id', user.id)
      .eq('is_primary', true)
      .maybeSingle();

    // Calculate life-in-weeks data (nur wenn birth_date gesetzt ist)
    // birth_date ist optional - kann null sein
    const lifeInWeeksData = profile.birth_date && profile.target_age
      ? getLifeInWeeksDataForUser(profile.birth_date, profile.target_age)
      : null;

    // Map to legacy Profile format
    const goalText = primaryGoal ? (primaryGoal as { title: string }).title : null;
    const mappedProfile = mapUserProfileToLegacyProfile(profile, goalText);
    
    // Create full Profile object with defaults for missing fields
    const fullProfile: Profile = {
      id: profile.user_id, // Use user_id as id
      identity: {
        name: mappedProfile.identity?.name || 'User',
        email: user.email || '',
        avatarUrl: undefined,
        birthdate: mappedProfile.identity?.birthdate || '',
        targetAge: mappedProfile.identity?.targetAge || 80,
      },
      goal: {
        text: mappedProfile.goal?.text || 'Noch keines gesetzt',
        source: 'custom',
        createdAt: mappedProfile.goal?.createdAt || profile.created_at,
        updatedAt: mappedProfile.goal?.updatedAt || profile.updated_at,
      },
      timePhilosophy: {
        optionId: profile.guide_personality || 'time-investment',
        label: profile.guide_personality || 'Zeit als Investition',
        selectedAt: profile.created_at,
      },
      lifestyle: {
        optionId: 'default',
        label: 'Standard',
        selectedAt: profile.created_at,
      },
      interests: [],
      projects: [],
      musicDNA: {
        genres: [],
        spotifyLinked: false,
      },
      progress: {
        guideStatus: 'warming-up',
        actionCount: 0,
        streak: 0,
        lastAction: profile.updated_at,
      },
      journey: [
        {
          id: 'onboarding-1',
          type: 'onboarding',
          description: 'Profil erstellt',
          timestamp: profile.created_at,
        },
      ],
      feedback: [],
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };

    return NextResponse.json({
      profile: fullProfile,
      rawProfile: profile,
      lifeInWeeks: lifeInWeeksData,
    });
  } catch (error) {
    console.error('Error in profile API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

