import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/profile/onboarding
 * Creates or updates user profile from onboarding data
 */
export async function POST(request: NextRequest) {
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
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        display_name: name || null,
        birth_date: birthDate,
        target_age: targetAgeNum,
        guide_personality: guidePersonality || timePhilosophy || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error upserting profile:', profileError);
      return NextResponse.json(
        { error: 'Failed to save profile', details: profileError.message },
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
        .single();

      if (existingGoal) {
        // Update existing primary goal
        const { data: updatedGoal, error: goalUpdateError } = await supabase
          .from('user_goals')
          .update({
            title: goalText,
            is_primary: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingGoal.id)
          .select()
          .single();

        if (!goalUpdateError && updatedGoal) {
          goalId = updatedGoal.id;
        }
      } else {
        // Create new primary goal
        const { data: newGoal, error: goalCreateError } = await supabase
          .from('user_goals')
          .insert({
            user_id: user.id,
            title: goalText,
            is_primary: true,
            status: 'active',
          })
          .select()
          .single();

        if (!goalCreateError && newGoal) {
          goalId = newGoal.id;
        }
      }

      // Update profile with main_goal_id if we have one
      if (goalId) {
        await supabase
          .from('user_profiles')
          .update({ main_goal_id: goalId })
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

