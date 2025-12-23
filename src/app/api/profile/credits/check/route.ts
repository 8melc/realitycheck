import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// GET: Check user credits and return reminder flags
export async function GET(req: NextRequest) {
  try {
    // Always return JSON, even if there's an error
    let supabase;
    try {
      supabase = await createSupabaseServerClient();
    } catch (clientError) {
      console.error('[Credits Check] Failed to create Supabase client:', clientError);
      return NextResponse.json({ 
        balance: 0,
        hasLowCredits: false,
        hasNoCredits: true,
        shouldShowReminder: false,
      }, { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (!supabase) {
      console.error('[Credits Check] Supabase client is null');
      return NextResponse.json({ 
        balance: 0,
        hasLowCredits: false,
        hasNoCredits: true,
        shouldShowReminder: false,
      }, { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      // Return default values instead of error for unauthenticated users
      return NextResponse.json({ 
        balance: 0,
        hasLowCredits: false,
        hasNoCredits: true,
        shouldShowReminder: false,
      }, { status: 200 });
    }
    
    // Get user credits balance
    let balance = 0;
    
    try {
      const { data: credits, error: creditsError } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (creditsError) {
        // If table doesn't exist or other error, log but don't fail
        console.warn('[Credits Check] Error fetching credits (table may not exist):', creditsError);
        // Return default values instead of failing
        balance = 0;
      } else {
        balance = credits?.balance || 0;
      }
    } catch (tableError) {
      // Table might not exist yet - return default values
      console.warn('[Credits Check] Table may not exist, using defaults:', tableError);
      balance = 0;
    }
    
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
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=60', // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error('[Credits Check] Error:', error);
    // Always return JSON, never HTML
    return NextResponse.json({ 
      balance: 0,
      hasLowCredits: false,
      hasNoCredits: true,
      shouldShowReminder: false,
      error: 'Internal server error'
    }, { 
      status: 200, // Return 200 with error flag instead of 500 to avoid HTML error page
      headers: { 'Content-Type': 'application/json' }
    });
  }
}


