import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/admin/create-melissa-test
 * Erstellt den Test-User melissa@test.com / RealityCheck123
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const email = 'melissa@test.com';
    const password = 'RealityCheck123';
    const userMetadata = { display_name: 'Melissa', role: 'tester' };

    // 1. User erstellen (Auth)
    const { data: userData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: userMetadata,
      email_confirm: true,
    });

    if (authError && !authError.message.includes('already exists')) {
      console.error('Auth Error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const userId = userData?.user?.id;

    // 2. Profil erstellen/upserten, damit der Login ins Dashboard leitet
    if (userId) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          display_name: 'Melissa (Tester)',
          is_public: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (profileError) {
        console.error('Profile Error:', profileError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Testuser melissa@test.com bereit.',
      credentials: { email, password }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


