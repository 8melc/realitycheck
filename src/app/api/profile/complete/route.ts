import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/profile/complete
 * 
 * Completes Phase 3 profile setup:
 * - Sets display_name (required)
 * - Updates is_public (optional, from toggle)
 * - Marks observatory_onboarding_completed = true if not already set
 * 
 * This is the final step of profile completion.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { display_name, is_public } = await request.json();

    // Validate display_name
    if (!display_name || typeof display_name !== 'string' || display_name.trim() === '') {
      return NextResponse.json(
        { error: 'display_name ist erforderlich' },
        { status: 400 }
      );
    }

    // Get current profile to check observatory_onboarding_completed
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('observatory_onboarding_completed')
      .eq('user_id', user.id)
      .single();

    // Update profile
    const updateData: Record<string, any> = {
      display_name: display_name.trim(),
      is_public: is_public === true,
      updated_at: new Date().toISOString(),
    };

    // If observatory_onboarding_completed is not yet true, set it to true
    // This ensures Phase 3 completion also completes observatory onboarding
    if (!currentProfile?.observatory_onboarding_completed) {
      updateData.observatory_onboarding_completed = true;
    }

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating profile for Phase 3 completion:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Unexpected error in profile complete API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

