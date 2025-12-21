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
      birth_date,
      targetAge,
      target_age,
      goal,
      goals,
      timePhilosophy,
      lifestyle,
      guidePersonality,
      focusTopic,
      focus_topic,
      bio,
      will_learn,
      will_share,
    } = body;

    const final_birth_date = birthDate || birth_date;
    const final_target_age = targetAge || target_age;
    const final_focus_topic = focusTopic || focus_topic;

    // Parse target age to number
    const targetAgeNum = typeof final_target_age === 'string' ? parseInt(final_target_age, 10) : final_target_age;

    // 4. VALIDIERUNG
    if (!final_birth_date) {
      return NextResponse.json(
        { error: 'Geburtsdatum fehlt' }, 
        { status: 400 }
      );
    }

    if (!targetAgeNum || targetAgeNum < 18 || targetAgeNum > 120) {
      return NextResponse.json(
        { error: 'Zielalter muss zwischen 18 und 120 liegen' }, 
        { status: 400 }
      );
    }

    // 6. Profile-Daten
    // WICHTIG: birth_date ist optional (nullable in DB)
    // Kann null sein, wenn User noch kein Geburtsdatum angegeben hat
    const profileData: UserProfileInsert = {
      user_id: user.id,
      display_name: name || 'FYF User',
      birth_date: final_birth_date || null, // Explizit null, wenn nicht vorhanden
      target_age: targetAgeNum,
      guide_personality: guidePersonality || timePhilosophy || null,
      bio: bio || null,
      focus_topic: final_focus_topic || null,
      will_learn: Array.isArray(will_learn) ? will_learn : [],
      will_share: Array.isArray(will_share) ? will_share : [],
      is_public: true,
      updated_at: new Date().toISOString(),
    };

    // 7. DB-Write mit Error-Handling
    const { data: profile, error: profileError } = await (supabase
      .from('user_profiles')
      .upsert(profileData as any, { onConflict: 'user_id' })
      .select()
      .single() as any);

    if (profileError || !profile) {
      console.error('Profile Error:', profileError);
      return NextResponse.json(
        { error: `Profil-Fehler: ${profileError?.message || 'Profil konnte nicht geladen werden'}` }, 
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

    // Create journey event: Profil erstellt
    try {
      await (supabase
        .from('user_journey_events') as any)
        .insert({
          user_id: user.id,
          label: 'Profil erstellt',
          type: 'milestone',
        });
    } catch (journeyError) {
      // Non-critical: Log but don't fail the request
      console.warn('[Onboarding] Could not create journey event:', journeyError);
    }

    // Initialize user credits if not exists
    try {
      const { data: existingCredits } = await supabase
        .from('user_credits')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!existingCredits) {
        await (supabase
          .from('user_credits') as any)
          .insert({
            user_id: user.id,
            balance: 50, // Initial credits
          });
      }
    } catch (creditsError) {
      // Non-critical: Log but don't fail the request
      console.warn('[Onboarding] Could not initialize credits:', creditsError);
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

