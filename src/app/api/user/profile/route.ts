import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/types/database.types';

type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];
type UserGoalUpdate = Database['public']['Tables']['user_goals']['Update'];

/**
 * PATCH /api/user/profile
 * Update user profile data (onboarding fields)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      display_name,
      birth_date,
      target_age,
      guide_personality,
      focus_topic,
      bio,
      will_learn,
      will_share,
      is_public,
      goal, // Primary goal title
    } = body;

    // Build profile update
    const profileUpdate: UserProfileUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (display_name !== undefined) profileUpdate.display_name = display_name;
    if (birth_date !== undefined) profileUpdate.birth_date = birth_date;
    if (target_age !== undefined) {
      const targetAgeNum = typeof target_age === 'string' ? parseInt(target_age, 10) : target_age;
      if (targetAgeNum < 18 || targetAgeNum > 120) {
        return NextResponse.json(
          { error: 'Zielalter muss zwischen 18 und 120 liegen' },
          { status: 400 }
        );
      }
      profileUpdate.target_age = targetAgeNum;
    }
    if (guide_personality !== undefined) profileUpdate.guide_personality = guide_personality;
    if (focus_topic !== undefined) profileUpdate.focus_topic = focus_topic;
    if (bio !== undefined) profileUpdate.bio = bio;
    if (will_learn !== undefined) profileUpdate.will_learn = Array.isArray(will_learn) ? will_learn : null;
    if (will_share !== undefined) profileUpdate.will_share = Array.isArray(will_share) ? will_share : null;
    if (is_public !== undefined) profileUpdate.is_public = is_public;

    // Update profile
    const { data: updatedProfile, error: profileError } = await (supabase
      .from('user_profiles') as any)
      .update(profileUpdate)
      .eq('user_id', user.id)
      .select()
      .single();

    if (profileError) {
      console.error('[Profile] Error updating profile:', profileError);
      return NextResponse.json(
        { error: profileError.message || 'Fehler beim Aktualisieren des Profils' },
        { status: 500 }
      );
    }

    // Update primary goal if provided
    if (goal !== undefined) {
      const { data: existingGoal } = await supabase
        .from('user_goals')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .maybeSingle();

      if (existingGoal) {
        // Update existing primary goal
        const goalUpdate: UserGoalUpdate = {
          title: goal,
          updated_at: new Date().toISOString(),
        };

        await (supabase
          .from('user_goals') as any)
          .update(goalUpdate as any)
          .eq('id', (existingGoal as any).id);
      } else if (goal) {
        // Create new primary goal if goal text is provided
        await (supabase
          .from('user_goals') as any)
          .insert({
            user_id: user.id,
            title: goal,
            is_primary: true,
            status: 'active',
          });
      }
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('[Profile] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

