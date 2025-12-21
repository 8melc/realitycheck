import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { chargeCredits } from '@/lib/credits/chargeCredits';

/**
 * POST /api/profile/override-limit
 * 
 * Erlaubt User, das Tageslimit mit 1 Credit zu überschreiben
 * Nutzt die zentrale chargeCredits-Funktion für konsistente Credit-Verwaltung
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Charge 1 credit for extending session
    const result = await chargeCredits(
      supabase,
      user.id,
      1,
      'extend_session',
      { action: 'override_daily_limit' }
    );

    if (!result.ok) {
      // Standardisierte Response für Frontend
      if (result.reason === 'INSUFFICIENT_CREDITS') {
        return NextResponse.json(
          {
            ok: false,
            error: 'INSUFFICIENT_CREDITS',
            credits: {
              balance: result.balance,
              required: result.required,
              message: `Du hast nicht genug Credits, um diese Session zu verlängern. Du hast aktuell ${result.balance} Credit${result.balance !== 1 ? 's' : ''}, benötigt werden ${result.required}.`,
            },
          },
          { status: 400 }
        );
      }

      // Andere Fehler
      return NextResponse.json(
        {
          ok: false,
          error: result.reason,
          message: result.error || 'Fehler beim Abziehen der Credits',
        },
        { status: 500 }
      );
    }

    // Erfolgreich
    return NextResponse.json({
      ok: true,
      credits: {
        cost: result.cost,
        new_balance: result.newBalance,
        message: `Dir wurden gerade ${result.cost} Credit${result.cost !== 1 ? 's' : ''} abgezogen.`,
      },
    });
  } catch (error: any) {
    console.error('[Override Limit] Error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'INTERNAL_ERROR',
        message: error?.message || 'Unerwarteter Fehler',
      },
      { status: 500 }
    );
  }
}
