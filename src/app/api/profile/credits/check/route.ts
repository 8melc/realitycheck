import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// GET: Check user credits and return reminder flags
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user credits balance
    const { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (creditsError) {
      console.error('[Credits Check] Error fetching credits:', creditsError);
      return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
    }
    
    const balance = credits?.balance || 0;
    
    // Calculate flags
    const hasNoCredits = balance === 0;
    const hasLowCredits = balance > 0 && balance < 5;
    const shouldShowReminder = hasNoCredits || hasLowCredits;
    
    // Check if user is admin (unlimited credits)
    // You can extend this to check user role from database
    const isAdmin = false; // TODO: Check from user metadata or role table
    
    return NextResponse.json({
      balance,
      hasLowCredits,
      hasNoCredits,
      shouldShowReminder: shouldShowReminder && !isAdmin,
    }, {
      headers: {
        'Cache-Control': 'private, max-age=60', // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error('[Credits Check] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

