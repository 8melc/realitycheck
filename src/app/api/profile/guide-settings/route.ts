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
      .select('guide_tone, nudging_frequency, nudging_paused_until')
      .eq('user_id', user.id)
      .maybeSingle() as { data: { guide_tone: string | null; nudging_frequency: string | null; nudging_paused_until: string | null } | null; error: any };
    
    if (profileError) {
      console.error('[Guide Settings] Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch guide settings' }, { status: 500 });
    }
    
    // Check if guide is muted (nudging_paused_until is set and in the future)
    const isMuted = profile?.nudging_paused_until 
      ? new Date(profile.nudging_paused_until) > new Date()
      : false;
    
    return NextResponse.json({
      guideTone: profile?.guide_tone || 'Straight',
      nudgingFrequency: profile?.nudging_frequency || 'standard',
      isGuideMuted: isMuted,
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
      updateData.nudging_frequency = nudgingFrequency;
    }
    
    // Handle guide mute: set nudging_paused_until to future date or null
    if (isGuideMuted !== undefined) {
      if (isGuideMuted) {
        // Pause for 1 year (effectively permanent until user unmutes)
        const pauseUntil = new Date();
        pauseUntil.setFullYear(pauseUntil.getFullYear() + 1);
        updateData.nudging_paused_until = pauseUntil.toISOString();
      } else {
        updateData.nudging_paused_until = null;
      }
    }
    
    // Try UPDATE first (profile should exist after onboarding)
    const { data: updatedProfile, error: updateError } = await (supabase
      .from('user_profiles') as any)
      .update(updateData)
      .eq('user_id', user.id)
      .select('guide_tone, nudging_frequency, nudging_paused_until')
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
    
    // Check if guide is muted
    const isMuted = updatedProfile.nudging_paused_until 
      ? new Date(updatedProfile.nudging_paused_until) > new Date()
      : false;
    
    return NextResponse.json({
      guideTone: updatedProfile.guide_tone || 'Straight',
      nudgingFrequency: updatedProfile.nudging_frequency || 'standard',
      isGuideMuted: isMuted,
    });
  } catch (error) {
    console.error('[Guide Settings] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

