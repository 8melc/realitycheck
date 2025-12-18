import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/admin/create-demo-profile
 * Creates the demo profile (Melissa Conrads) for People page showcase
 * 
 * Requires: SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseServiceKey) {
      return NextResponse.json(
        { 
          error: 'SUPABASE_SERVICE_ROLE_KEY not configured. Add it to .env.local',
          instructions: 'Get your service role key from Supabase Dashboard → Settings → API → service_role key'
        },
        { status: 500 }
      );
    }
    
    // Create admin client with service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const demoEmail = 'melissa.conrads@realitycheck.com';
    const demoPassword = 'demo123!';
    const demoDisplayName = 'Melissa Conrads';
    const demoBirthDate = '1997-08-08';
    const demoTargetAge = 85;
    const demoGuidePersonality = 'Ich will meine Zeit so investieren, dass sie Dividende für mein Leben zahlt.';
    const demoGoal = 'Workation Winter 25/26, RealityCheck-Prototyp-Launch, Studienprojekt';

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === demoEmail);

    let userId: string;

    if (existingUser) {
      console.log('Demo user already exists:', existingUser.id);
      userId = existingUser.id;
    } else {
      // Create auth user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: demoEmail,
        password: demoPassword,
        email_confirm: true, // Auto-confirm email
      });

      if (createError) {
        console.error('Error creating auth user:', createError);
        return NextResponse.json(
          { 
            error: 'Failed to create auth user', 
            details: createError.message 
          },
          { status: 500 }
        );
      }

      if (!newUser.user) {
        return NextResponse.json(
          { error: 'User creation returned no user' },
          { status: 500 }
        );
      }

      userId = newUser.user.id;
      console.log('Created demo auth user:', userId);
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingProfile) {
      console.log('Profile already exists for user:', userId);
      
      // Update existing profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          display_name: demoDisplayName,
          birth_date: demoBirthDate,
          target_age: demoTargetAge,
          guide_personality: demoGuidePersonality,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return NextResponse.json(
          { 
            error: 'Failed to update profile', 
            details: updateError.message 
          },
          { status: 500 }
        );
      }
      console.log('Updated profile for user:', userId);
    } else {
      // Create profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          display_name: demoDisplayName,
          birth_date: demoBirthDate,
          target_age: demoTargetAge,
          guide_personality: demoGuidePersonality,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return NextResponse.json(
          { 
            error: 'Failed to create profile', 
            details: profileError.message 
          },
          { status: 500 }
        );
      }
      console.log('Created profile for user:', userId);
    }

    // Check if goal already exists
    const { data: existingGoal } = await supabase
      .from('user_goals')
      .select('id')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .maybeSingle();

    if (existingGoal) {
      // Update existing goal
      const { error: goalUpdateError } = await supabase
        .from('user_goals')
        .update({
          title: demoGoal,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingGoal.id);

      if (goalUpdateError) {
        console.error('Error updating goal:', goalUpdateError);
      } else {
        console.log('Updated goal for user:', userId);
      }
    } else {
      // Create goal
      const { error: goalError } = await supabase
        .from('user_goals')
        .insert({
          user_id: userId,
          title: demoGoal,
          is_primary: true,
          status: 'active',
        });

      if (goalError) {
        console.error('Error creating goal:', goalError);
        // Don't fail if goal creation fails
      } else {
        console.log('Created goal for user:', userId);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demo profile (Melissa Conrads) created successfully',
      profile: {
        user_id: userId,
        email: demoEmail,
        password: demoPassword,
        display_name: demoDisplayName,
        birth_date: demoBirthDate,
        target_age: demoTargetAge,
        guide_personality: demoGuidePersonality,
        goal: demoGoal,
      },
      note: 'This profile will now appear on /people page'
    });
  } catch (error: any) {
    console.error('Error in create-demo-profile API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}
