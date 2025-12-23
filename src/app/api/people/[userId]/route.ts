import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/people/[userId]
 * 
 * Returns a single public user profile.
 * 
 * OWNERSHIP: This API reads ONLY public fields (see FIELD_MATRIX.md).
 * 
 * Public fields read (same as /api/people):
 * - user_id, display_name, birth_date, target_age, goal_direction
 * - avatar_type, avatar_url, avatar_seed, avatar_style
 * - is_public, bio
 * - created_at, updated_at
 * 
 * Plus from user_goals (join): title (as primary_goal.title)
 * 
 * This API does NOT read private fields.
 * 
 * See FIELD_MATRIX.md and API_OWNERSHIP.md for complete field ownership rules.
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params; // ← Next.js 15 fix

  console.log('Single Profile API - Request received for userId:', userId);

  try {
    const supabase = await createClient();

    // 1. Profil laden (nur öffentlich beobachtbare Felder)
    // EXPLICIT select list - only public fields (see FIELD_MATRIX.md)
    // This API reads the same public fields as /api/people
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_id, display_name, birth_date, target_age, goal_direction, avatar_type, avatar_url, avatar_seed, avatar_style, is_public, bio, created_at, updated_at')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Single Profile API - Profile error:', {
        code: profileError.code,
        message: profileError.message,
        userId
      });

      // PGRST116 = keine Zeile gefunden
      if (profileError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Profil nicht gefunden', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { 
          error: profileError.message || 'Fehler beim Laden des Profils',
          code: profileError.code 
        },
        { status: 500 }
      );
    }

    // Check if profile is public
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    const isOwner = currentUser?.id === userId;

    if (!profile.is_public && !isOwner) {
      return NextResponse.json(
        { error: 'Profil ist nicht öffentlich', code: 'PRIVATE_PROFILE' },
        { status: 403 }
      );
    }

    // 2. Primary Goal laden (optional)
    const { data: goals, error: goalError } = await supabase
      .from('user_goals')
      .select('id, title, status')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .limit(1);

    if (goalError) {
      console.warn('Single Profile API - Goal load failed (non-critical):', goalError);
    }

    const primaryGoal = goals && goals.length > 0 ? goals[0] : null;

    // 3. Response zusammenbauen
    const response = {
      ...profile,
      primary_goal: primaryGoal
    };

    console.log('Single Profile API - Success:', {
      userId,
      displayName: profile.display_name,
      hasGoal: !!primaryGoal,
      hasGoalDirection: !!profile.goal_direction
    });

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Single Profile API - Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Interner Serverfehler',
        details: error.message 
      },
      { status: 500 }
    );
  }
}



