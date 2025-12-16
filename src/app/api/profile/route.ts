import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLifeInWeeksDataForUser } from '@/lib/domain/lifeInWeeks';
import type { UserProfile } from '@/lib/types/database.types';

/**
 * GET /api/profile
 * Get current user's profile with life-in-weeks data
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
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single<UserProfile>();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // Profile not found
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // Calculate life-in-weeks data
    const lifeInWeeksData = getLifeInWeeksDataForUser(
      profile.birth_date,
      profile.target_age
    );

    return NextResponse.json({
      profile,
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

