import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Result type for credit charging operations
 */
export type CreditResult =
  | { ok: true; newBalance: number; cost: number }
  | { ok: false; reason: 'INSUFFICIENT_CREDITS'; balance: number; required: number }
  | { ok: false; reason: 'CREDITS_FETCH_ERROR' | 'CREDITS_UPDATE_ERROR' | 'HISTORY_ERROR'; error?: string };

/**
 * Charge credits from a user's account
 * 
 * This is the central function for all credit-based operations.
 * It:
 * 1. Checks current credit balance
 * 2. Validates sufficient credits
 * 3. Deducts credits from user_credits table
 * 4. Records transaction in credit_history table
 * 
 * @param supabase - Supabase client instance
 * @param userId - User ID to charge credits from
 * @param cost - Number of credits to charge (must be positive)
 * @param reason - Reason for the charge (e.g., 'extend_session', 'guide_message', 'content_open')
 * @param meta - Optional metadata to store in credit_history (e.g., { session_id, content_id })
 * @returns CreditResult indicating success or failure
 */
export async function chargeCredits(
  supabase: SupabaseClient,
  userId: string,
  cost: number,
  reason: string,
  meta?: Record<string, any>
): Promise<CreditResult> {
  // Validate cost
  if (cost <= 0) {
    return { ok: false, reason: 'CREDITS_UPDATE_ERROR', error: 'Cost must be positive' };
  }

  try {
    // 1. Get current credit balance
    let { data: credits, error: creditsError } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();

    if (creditsError) {
      console.error('[chargeCredits] Error fetching credits:', creditsError);
      return { ok: false, reason: 'CREDITS_FETCH_ERROR', error: creditsError.message };
    }

    // If no credits entry exists, create one with balance = 0
    if (!credits) {
      const { data: newCredits, error: createError } = await supabase
        .from('user_credits')
        .insert({ user_id: userId, balance: 0 })
        .select('balance')
        .single();

      if (createError) {
        console.error('[chargeCredits] Error creating credits:', createError);
        return { ok: false, reason: 'CREDITS_FETCH_ERROR', error: createError.message };
      }
      credits = newCredits;
    }

    const currentBalance = credits.balance ?? 0;

    // 2. Check if sufficient credits available
    if (currentBalance < cost) {
      return {
        ok: false,
        reason: 'INSUFFICIENT_CREDITS',
        balance: currentBalance,
        required: cost,
      };
    }

    // 3. Calculate new balance
    const newBalance = currentBalance - cost;

    // 4. Update credit balance
    const { data: updatedCredits, error: updateError } = await supabase
      .from('user_credits')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select('balance')
      .single();

    if (updateError) {
      console.error('[chargeCredits] Error updating credits:', updateError);
      return { ok: false, reason: 'CREDITS_UPDATE_ERROR', error: updateError.message };
    }

    // 5. Record transaction in credit_history
    const { error: historyError } = await supabase
      .from('credit_history')
      .insert({
        user_id: userId,
        amount: -cost, // Negative for spending
        balance_after: newBalance,
        reason,
        meta: meta || null,
      });

    if (historyError) {
      // Log but don't fail - history is important but shouldn't block the operation
      console.error('[chargeCredits] Error recording history (non-blocking):', historyError);
      // Continue anyway - credits were deducted successfully
    }

    return {
      ok: true,
      newBalance: updatedCredits.balance,
      cost,
    };
  } catch (error: any) {
    console.error('[chargeCredits] Unexpected error:', error);
    return {
      ok: false,
      reason: 'CREDITS_UPDATE_ERROR',
      error: error?.message || 'Unknown error',
    };
  }
}

/**
 * Get current credit balance for a user
 * 
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @returns Current balance (0 if no entry exists)
 */
export async function getCreditBalance(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { data: credits, error } = await supabase
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[getCreditBalance] Error:', error);
    return 0;
  }

  return credits?.balance ?? 0;
}

