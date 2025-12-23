import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/profile/observatory
 * Completes Observatory (People) onboarding and sets visibility preferences
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
    const { isPublic, bio } = body;

    // Validate
    if (typeof isPublic !== 'boolean') {
      return NextResponse.json(
        { error: 'isPublic must be a boolean' },
        { status: 400 }
      );
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Profile not found. Please complete system onboarding first.' },
        { status: 404 }
      );
    }

    // Update profile: mark observatory onboarding as completed
    // Set is_public and optional bio
    const updateData: Record<string, any> = {
      observatory_onboarding_completed: true,
      is_public: isPublic,
      updated_at: new Date().toISOString(),
    };

    // Only set bio if provided and user wants to be public
    if (isPublic && bio && typeof bio === 'string' && bio.trim()) {
      const bioText = bio.trim();
      if (bioText.length > 120) {
        return NextResponse.json(
          { error: 'Bio must be 120 characters or less' },
          { status: 400 }
        );
      }
      updateData.bio = bioText;
    } else if (!isPublic) {
      // Clear bio if user doesn't want to be public
      updateData.bio = null;
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('[Observatory API] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('[Observatory API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

