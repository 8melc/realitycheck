import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/admin/create-test-user
 * Creates a test user account with profile
 * 
 * Usage: Call this endpoint once to set up test account
 * Email: testuser@realitycheck.com
 * Password: test123!
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
    
    const testEmail = 'testuser@realitycheck.com';
    const testPassword = 'test123!';
    const testDisplayName = 'Test User';
    const testBirthDate = '1990-01-15';
    const testTargetAge = 80;
    const testGuidePersonality = 'Zeit als Investition';
    const testGoal = 'RealityCheck erfolgreich testen';

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === testEmail);

    let userId: string;

    if (existingUser) {
      console.log('Test user already exists:', existingUser.id);
      userId = existingUser.id;
    } else {
      // Create auth user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
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
      console.log('Created auth user:', userId);
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
          display_name: testDisplayName,
          birth_date: testBirthDate,
          target_age: testTargetAge,
          guide_personality: testGuidePersonality,
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
    } else {
      // Create profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          display_name: testDisplayName,
          birth_date: testBirthDate,
          target_age: testTargetAge,
          guide_personality: testGuidePersonality,
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
          title: testGoal,
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
          title: testGoal,
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
      message: 'Test user created successfully',
      user: {
        id: userId,
        email: testEmail,
        password: testPassword,
        display_name: testDisplayName,
        birth_date: testBirthDate,
        target_age: testTargetAge,
        guide_personality: testGuidePersonality,
        goal: testGoal,
      },
      note: 'You can now login with testuser@realitycheck.com / test123!'
    });
  } catch (error: any) {
    console.error('Error in create-test-user API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

