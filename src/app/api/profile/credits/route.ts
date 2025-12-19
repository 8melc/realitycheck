import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// GET: Retrieve user credits with stats
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
      console.error('[Credits] Error fetching credits:', creditsError);
      return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
    }
    
    const balance = credits?.balance || 0;
    
    // Calculate credit value (0.50 EUR per credit)
    const creditValue = 0.50;
    const totalValue = balance * creditValue;
    
    // Calculate consumed credits this week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Try to get consumed credits from credit_transactions if table exists
    let consumedThisWeek = 0;
    try {
      const { data: transactions } = await (supabase
        .from('credit_transactions') as any)
        .select('amount')
        .eq('user_id', user.id)
        .eq('transaction_type', 'consumption') // Only count consumption transactions
        .gte('created_at', startOfWeek.toISOString());
      
      if (transactions && Array.isArray(transactions)) {
        consumedThisWeek = transactions.reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0);
      }
    } catch (transError) {
      // If credit_transactions table doesn't exist or query fails, use default
      console.warn('[Credits] Could not fetch transactions, using default:', transError);
      consumedThisWeek = 0; // Default fallback
    }
    
    return NextResponse.json({
      balance,
      value: totalValue,
      consumedThisWeek,
      creditValue,
    });
  } catch (error) {
    console.error('[Credits] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
