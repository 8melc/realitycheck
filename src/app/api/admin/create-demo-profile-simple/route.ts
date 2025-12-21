import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/admin/create-demo-profile-simple
 * Creates demo profile directly in user_profiles table
 * Works without Service Role Key - uses regular client
 * 
 * This creates a profile for a demo user that will show on /people
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Demo profile data (Melissa Conrads)
    const demoDisplayName = 'Melissa Conrads';
    const demoBirthDate = '1997-08-08';
    const demoTargetAge = 85;
    const demoGuidePersonality = 'Ich will meine Zeit so investieren, dass sie Dividende für mein Leben zahlt.';
    const demoGoal = 'Workation Winter 25/26, RealityCheck-Prototyp-Launch, Studienprojekt';

    // Try to find existing demo user or use a fixed demo user_id
    // First, let's check if we can find any user
    const { data: { user } } = await supabase.auth.getUser();
    
    // For demo purposes, we'll create a profile with a placeholder user_id
    // In production, you'd want to create the auth user first
    // For now, we'll try to insert directly (might fail if RLS blocks it)
    
    // Option 1: Try to create profile for current user if logged in
    if (user) {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!existingProfile) {
        // Create profile for current user
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            display_name: demoDisplayName,
            birth_date: demoBirthDate,
            target_age: demoTargetAge,
            guide_personality: demoGuidePersonality,
          });

        if (!profileError) {
          // Create goal
          await supabase
            .from('user_goals')
            .insert({
              user_id: user.id,
              title: demoGoal,
              is_primary: true,
              status: 'active',
            });

          return NextResponse.json({
            success: true,
            message: 'Demo profile created for current user',
            profile: {
              user_id: user.id,
              display_name: demoDisplayName,
              birth_date: demoBirthDate,
              target_age: demoTargetAge,
            }
          });
        }
      }
    }

    // Option 2: Create profile using SQL (if we have access)
    // This is a workaround - in production you'd use Service Role Key
    return NextResponse.json({
      success: false,
      error: 'Cannot create profile without Service Role Key',
      instructions: `
To create the demo profile, you have two options:

1. Add SUPABASE_SERVICE_ROLE_KEY to .env.local and use /api/admin/create-demo-profile
2. Or manually in Supabase SQL Editor:

-- First, create auth user (or use existing)
-- Then run:
INSERT INTO public.user_profiles (
  user_id,
  display_name,
  birth_date,
  target_age,
  guide_personality
) VALUES (
  'USER_ID_HIER', -- Replace with actual user_id
  'Melissa Conrads',
  '1997-08-08',
  85,
  'Ich will meine Zeit so investieren, dass sie Dividende für mein Leben zahlt.'
);

INSERT INTO public.user_goals (
  user_id,
  title,
  is_primary,
  status
) VALUES (
  'USER_ID_HIER', -- Same user_id
  'Workation Winter 25/26, RealityCheck-Prototyp-Launch, Studienprojekt',
  true,
  'active'
);
      `.trim()
    }, { status: 400 });
  } catch (error: any) {
    console.error('Error in create-demo-profile-simple API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

