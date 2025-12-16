import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database, UserProfile, UserGoal } from '@/lib/types/database.types';

type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];
type UserGoalInsert = Database['public']['Tables']['user_goals']['Insert'];
type UserGoalUpdate = Database['public']['Tables']['user_goals']['Update'];

/**
 * POST /api/profile/onboarding
 * Creates or updates user profile from onboarding data
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      birthDate,
      targetAge,
      goal,
      goals,
      timePhilosophy,
      lifestyle,
      guidePersonality,
    } = body;

    // Validate required fields
    if (!birthDate || !targetAge) {
      return NextResponse.json(
        { error: 'birthDate and targetAge are required' },
        { status: 400 }
      );
    }

    // Parse target age to number
    const targetAgeNum = parseInt(targetAge, 10);
    if (isNaN(targetAgeNum) || targetAgeNum < 18 || targetAgeNum > 120) {
      return NextResponse.json(
        { error: 'targetAge must be between 18 and 120' },
        { status: 400 }
      );
    }

    // Create or update user profile
    const profileData: UserProfileInsert = {
      user_id: user.id,
      display_name: name || null,
      birth_date: birthDate,
      target_age: targetAgeNum,
      guide_personality: guidePersonality || timePhilosophy || null,
      updated_at: new Date().toISOString(),
    };

    const profileResult = await supabase
      .from('user_profiles')
      .upsert(profileData as any, {
        onConflict: 'user_id',
      })
      .select()
      .single();
    
    const { data: profile, error: profileError } = profileResult as { data: UserProfile | null; error: any };

    if (profileError || !profile) {
      console.error('Error upserting profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to save profile', details: profileError?.message || 'Profile is null' },
        { status: 500 }
      );
    }

    // If goal is provided, create or update primary goal
    let goalId: string | null = null;
    if (goal || (goals && goals.length > 0)) {
      const goalText = goal || goals[0];
      
      // Check if user already has a primary goal
      const { data: existingGoal } = await supabase
        .from('user_goals')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .maybeSingle<UserGoal>();

      if (existingGoal) {
        // Update existing primary goal
        const goalUpdateData: UserGoalUpdate = {
          title: goalText,
          is_primary: true,
          updated_at: new Date().toISOString(),
        };

        const goalUpdateResult = await (supabase
          .from('user_goals') as any)
          .update(goalUpdateData)
          .eq('id', existingGoal.id)
          .select()
          .single();
        
        const { data: updatedGoal, error: goalUpdateError } = goalUpdateResult as { data: UserGoal | null; error: any };

        if (!goalUpdateError && updatedGoal) {
          goalId = updatedGoal.id;
        }
      } else {
        // Create new primary goal
        const goalInsertData: UserGoalInsert = {
          user_id: user.id,
          title: goalText,
          is_primary: true,
          status: 'active',
        };

        const goalInsertResult = await (supabase
          .from('user_goals') as any)
          .insert(goalInsertData)
          .select()
          .single();
        
        const { data: newGoal, error: goalCreateError } = goalInsertResult as { data: UserGoal | null; error: any };

        if (!goalCreateError && newGoal) {
          goalId = newGoal.id;
        }
      }

      // Update profile with main_goal_id if we have one
      if (goalId) {
        const profileUpdateData: UserProfileUpdate = {
          main_goal_id: goalId,
        };

        await (supabase
          .from('user_profiles') as any)
          .update(profileUpdateData)
          .eq('user_id', user.id);
      }
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        user_id: profile.user_id,
        birth_date: profile.birth_date,
        target_age: profile.target_age,
      },
    });
  } catch (error) {
    console.error('Error in onboarding API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

