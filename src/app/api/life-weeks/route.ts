import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLifeInWeeksDataForUser } from '@/lib/domain/lifeInWeeks';

/**
 * GET /api/life-weeks
 * Get life-in-weeks data for current user
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
      .select('birth_date, target_age')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // Profile not found
        return NextResponse.json(
          { error: 'Profile not found. Please complete onboarding first.' },
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

    if (!lifeInWeeksData) {
      return NextResponse.json(
        { error: 'Missing birth_date or target_age in profile' },
        { status: 400 }
      );
    }

    return NextResponse.json(lifeInWeeksData);
  } catch (error) {
    console.error('Error in life-weeks API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

