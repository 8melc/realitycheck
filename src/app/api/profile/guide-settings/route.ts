import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// GET: Retrieve guide settings
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get guide settings from user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('guide_tone, guide_nudging_frequency, guide_muted')
      .eq('user_id', user.id)
      .maybeSingle() as { data: { guide_tone: string | null; guide_nudging_frequency: string | null; guide_muted: boolean | null } | null; error: any };
    
    if (profileError) {
      console.error('[Guide Settings] Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch guide settings' }, { status: 500 });
    }
    
    return NextResponse.json({
      guideTone: profile?.guide_tone || 'straight',
      nudgingFrequency: profile?.guide_nudging_frequency || 'medium',
      isGuideMuted: profile?.guide_muted || false,
    });
  } catch (error) {
    console.error('[Guide Settings] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update guide settings
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { guideTone, nudgingFrequency, isGuideMuted } = body;
    
    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (guideTone !== undefined) {
      updateData.guide_tone = guideTone;
    }
    
    if (nudgingFrequency !== undefined) {
      updateData.guide_nudging_frequency = nudgingFrequency;
    }
    
    if (isGuideMuted !== undefined) {
      updateData.guide_muted = isGuideMuted;
    }
    
    // Try UPDATE first (profile should exist after onboarding)
    const { data: updatedProfile, error: updateError } = await (supabase
      .from('user_profiles') as any)
      .update(updateData)
      .eq('user_id', user.id)
      .select('guide_tone, guide_nudging_frequency, guide_muted')
      .maybeSingle();
    
    if (updateError) {
      console.error('[Guide Settings] Update error:', updateError);
      
      // If error is "0 rows" or PGRST116, profile doesn't exist
      if (updateError.code === 'PGRST116' || updateError.message?.includes('0 rows') || updateError.message?.includes('No rows')) {
        return NextResponse.json(
          { error: 'Profile not found. Please complete onboarding first.' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: updateError.message || 'Failed to update guide settings' },
        { status: 500 }
      );
    }
    
    // If no rows were updated but no error, profile might not exist
    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Profile not found. Please complete onboarding first.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      guideTone: updatedProfile.guide_tone || 'straight',
      nudgingFrequency: updatedProfile.guide_nudging_frequency || 'medium',
      isGuideMuted: updatedProfile.guide_muted || false,
    });
  } catch (error) {
    console.error('[Guide Settings] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

