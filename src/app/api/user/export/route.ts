import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /api/user/export
 * Export all user data (DSGVO)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Collect all user data
    const [profileResult, goalsResult, creditsResult] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id),
      supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single(),
    ]);

    const exportData = {
      account: {
        email: user.email,
        id: user.id,
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at,
        user_metadata: user.user_metadata,
      },
      profile: profileResult.data,
      goals: goalsResult.data || [],
      credits: creditsResult.data,
      exported_at: new Date().toISOString(),
    };

    return NextResponse.json(exportData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="realitycheck-export-${user.id}-${Date.now()}.json"`,
      },
    });
  } catch (error: any) {
    console.error('[Export] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}



