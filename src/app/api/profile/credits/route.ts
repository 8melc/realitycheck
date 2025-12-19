import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// GET: Retrieve user credits
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user credits
    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (creditsError) {
      console.error('[Credits] Error fetching credits:', creditsError);
      return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
    }
    
    // If no credits record exists, return default
    return NextResponse.json({
      balance: credits?.balance || 0,
    });
  } catch (error) {
    console.error('[Credits] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
