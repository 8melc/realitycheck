import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/profile/override-limit
 * 
 * Erlaubt User, das Tageslimit mit 1 Credit zu überschreiben
 * Prüft Credits-Balance und zieht 1 Credit ab
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Hole Credits-Balance aus user_credits
    // Falls kein Eintrag existiert, erstelle einen mit balance = 0
    let { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creditsError) {
      console.error('[Override Limit] Error fetching credits:', creditsError);
      return NextResponse.json(
        { success: false, reason: 'CREDITS_FETCH_ERROR' },
        { status: 500 }
      );
    }

    // Falls kein Credits-Eintrag existiert, erstelle einen
    if (!credits) {
      const { data: newCredits, error: createError } = await supabase
        .from('user_credits')
        .insert({ user_id: user.id, balance: 0 })
        .select('balance')
        .single();

      if (createError) {
        console.error('[Override Limit] Error creating credits:', createError);
        return NextResponse.json(
          { success: false, reason: 'CREDITS_CREATE_ERROR' },
          { status: 500 }
        );
      }
      credits = newCredits;
    }

    const currentBalance = credits.balance ?? 0;

    // Prüfe, ob genug Credits vorhanden sind
    if (currentBalance < 1) {
      return NextResponse.json(
        { success: false, reason: 'NO_CREDITS', remainingCredits: currentBalance },
        { status: 400 }
      );
    }

    // Ziehe 1 Credit ab
    const { data: updatedCredits, error: updateError } = await supabase
      .from('user_credits')
      .update({ 
        balance: currentBalance - 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select('balance')
      .single();

    if (updateError) {
      console.error('[Override Limit] Error updating credits:', updateError);
      return NextResponse.json(
        { success: false, reason: 'UPDATE_ERROR' },
        { status: 500 }
      );
    }

    // Optional: Track override usage (kann später für Analytics verwendet werden)
    // z.B. in user_profiles: override_used_today = true

    return NextResponse.json({
      success: true,
      remainingCredits: updatedCredits.balance,
    });
  } catch (error) {
    console.error('[Override Limit] Error:', error);
    return NextResponse.json(
      { success: false, reason: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
