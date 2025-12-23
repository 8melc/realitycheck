import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Database, UserProfile, UserGoal } from '@/lib/types/database.types';

type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];
type UserGoalInsert = Database['public']['Tables']['user_goals']['Insert'];
type UserGoalUpdate = Database['public']['Tables']['user_goals']['Update'];

/**
 * POST /api/profile/onboarding
 * 
 * Creates or updates user profile from onboarding data.
 * 
 * OWNERSHIP: This API is the SINGLE SOURCE OF TRUTH for initial profile fields.
 * 
 * Fields written by this API (INITIAL fields, set once during onboarding):
 * - display_name (REQUIRED)
 * - birth_date (REQUIRED, NOT NULL)
 * - target_age (REQUIRED)
 * - goal_direction (optional)
 * - answer_style (optional, default: 'medium')
 * - guide_tone (optional, default: 'Straight') - can be changed later via /api/profile/guide-settings
 * - main_goal_id (if goal text is provided, via user_goals table)
 * 
 * This API does NOT write:
 * - Settings fields (nudging_frequency, is_public, bio, etc.) - use respective Settings APIs
 * - Avatar fields - use /api/profile/avatar
 * - Any other fields not listed above
 * 
 * See FIELD_MATRIX.md and API_OWNERSHIP.md for complete field ownership rules.
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

    // SCHRITT 1: Profil-Existenz garantieren (OHNE birth_date, OHNE Validierung)
    // Dieses Profil MUSS existieren, bevor Onboarding beginnt
    // NOTE: 'RealityCheck User' ist nur temporär und wird sofort im nächsten Schritt überschrieben
    await (supabase
      .from('user_profiles')
      .upsert(
        {
          user_id: user.id,
          display_name: 'RealityCheck User', // TEMPORARY - wird sofort im Update überschrieben
        } as any,
        { onConflict: 'user_id' }
      ) as any);

    const body = await request.json();
    const {
      name,
      email,
      birthDate,
      birth_date,
      targetAge,
      target_age,
      goal,
      goalDirection,
      goal_direction,
      answerStyle,
      answer_style,
      guideTone,
      guide_tone,
    } = body;

    // VALIDIERUNG: Nur erlaubte Felder
    const final_birth_date = birthDate || birth_date;
    const final_target_age = targetAge || target_age;
    const final_goal_direction = goalDirection || goal_direction || null;
    const final_answer_style = answerStyle || answer_style || 'medium';
    const final_guide_tone = guideTone || guide_tone || 'straight';

    // Parse target age to number
    const targetAgeNum = typeof final_target_age === 'string' ? parseInt(final_target_age, 10) : final_target_age;

    // VALIDIERUNG: Pflichtfelder
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name fehlt' }, 
        { status: 400 }
      );
    }

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

    // VALIDIERUNG: Ziel (ENTWEDER goal ODER goalDirection)
    if (!goal?.trim() && !final_goal_direction) {
      return NextResponse.json(
        { error: 'Entweder Ziel-Text oder Ziel-Richtung muss angegeben werden' },
        { status: 400 }
      );
    }

    if (goal?.trim() && final_goal_direction) {
      return NextResponse.json(
        { error: 'Nur Ziel-Text ODER Ziel-Richtung, nicht beides' },
        { status: 400 }
      );
    }

    // VALIDIERUNG: goal_direction
    if (final_goal_direction) {
      const allowedDirections = new Set(['freedom', 'clarity', 'growth', 'balance', 'meaning']);
      if (!allowedDirections.has(final_goal_direction)) {
        return NextResponse.json(
          { error: 'Ungültige Ziel-Richtung' },
          { status: 400 }
        );
      }
    }

    // VALIDIERUNG: answer_style
    const allowedAnswerStyles = new Set(['short', 'medium', 'long']);
    if (!allowedAnswerStyles.has(final_answer_style)) {
      return NextResponse.json(
        { error: 'Ungültige Antwort-Länge' },
        { status: 400 }
      );
    }

    // VALIDIERUNG: guide_tone
    const allowedGuideTones = new Set(['soft', 'straight', 'hard']);
    if (!allowedGuideTones.has(final_guide_tone)) {
      return NextResponse.json(
        { error: 'Ungültiger Guide-Ton' },
        { status: 400 }
      );
    }

    // Mapping: guide_tone (soft -> Soft Touch, straight -> Straight, hard -> Hard Truth)
    const guideToneMapping: Record<string, string> = {
      'soft': 'Soft Touch',
      'straight': 'Straight',
      'hard': 'Hard Truth',
    };
    const mapped_guide_tone = guideToneMapping[final_guide_tone] || 'Straight';

    // UPDATE: Nur erlaubte Initial-Felder (siehe API_OWNERSHIP.md)
    // Diese Felder werden NUR beim Onboarding gesetzt und sollten danach nicht mehr geändert werden
    // (Ausnahme: guide_tone kann später via /api/profile/guide-settings geändert werden)
    const updateData: Record<string, any> = {
      display_name: name.trim(),
      birth_date: final_birth_date, // NIEMALS NULL - API erzwingt NOT NULL (auch wenn DB nullable ist)
      target_age: targetAgeNum,
      goal_direction: final_goal_direction,
      answer_style: final_answer_style,
      guide_tone: mapped_guide_tone, // Initial gesetzt, kann später via guide-settings API geändert werden
      updated_at: new Date().toISOString(),
    };

    // Einfaches UPDATE (Profil existiert garantiert durch Schritt 1)
    const updateResult = await ((supabase
      .from('user_profiles') as any)
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single());
    
    const profile = updateResult.data;
    const profileError = updateResult.error;

    if (profileError || !profile) {
      console.error('[Onboarding API] Profile Update Error:', {
        error: profileError,
        code: profileError?.code,
        message: profileError?.message,
        details: profileError?.details,
        hint: profileError?.hint,
      });
      
      return NextResponse.json(
        { 
          error: `Profil-Fehler: ${profileError?.message || 'Profil konnte nicht aktualisiert werden'}`,
          details: profileError?.details,
          code: profileError?.code
        }, 
        { status: 500 }
      );
    }

    console.log('[Onboarding API] Profile updated successfully:', profile.id);

    // CONSISTENCY: main_goal_id ↔ user_goals.is_primary
    // If goal is provided (freier Text), create or update primary goal in user_goals,
    // then set main_goal_id in user_profiles to maintain consistency.
    // This ensures that main_goal_id always points to a goal with is_primary = true.
    let goalId: string | null = null;
    if (goal && goal.trim()) {
      const goalText = goal.trim();
      
      // Check if user already has a primary goal
      const { data: existingGoal } = await supabase
        .from('user_goals')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .maybeSingle<UserGoal>();

      if (existingGoal) {
        // Update existing primary goal (preserve is_primary = true)
        const goalUpdateData: UserGoalUpdate = {
          title: goalText,
          is_primary: true, // Maintain consistency
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
        // Create new primary goal (with is_primary = true)
        const goalInsertData: UserGoalInsert = {
          user_id: user.id,
          title: goalText,
          is_primary: true, // Set as primary
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

      // Update profile with main_goal_id to maintain consistency
      // main_goal_id must point to the goal we just created/updated (which has is_primary = true)
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

