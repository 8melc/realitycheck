import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/nudges/dismiss
 * User dismisses a nudge (dismissed, snoozed, or halt_die_fresse)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nudge_id, action } = body;

    if (!nudge_id || !action) {
      return NextResponse.json(
        { error: 'Missing nudge_id or action' },
        { status: 400 }
      );
    }

    // Validate action
    const validActions = ['dismissed', 'snoozed', 'halt_die_fresse', 'engaged'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Verify nudge belongs to user
    const { data: nudge, error: fetchError } = await supabase
      .from('nudges_sent')
      .select('id, user_id')
      .eq('id', nudge_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError || !nudge) {
      return NextResponse.json(
        { error: 'Nudge not found' },
        { status: 404 }
      );
    }

    // Update nudge with dismissal
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('nudges_sent')
      .update({
        dismissed_at: now,
        action_taken: action,
      })
      .eq('id', nudge_id);

    if (updateError) {
      console.error('[Nudges] Error updating nudge:', updateError);
      return NextResponse.json(
        { error: 'Failed to update nudge' },
        { status: 500 }
      );
    }

    // If "halt_die_fresse", pause nudging for 24 hours
    if (action === 'halt_die_fresse') {
      const pauseUntil = new Date();
      pauseUntil.setHours(pauseUntil.getHours() + 24);

      const { error: pauseError } = await supabase
        .from('user_profiles')
        .update({
          nudging_paused_until: pauseUntil.toISOString(),
        })
        .eq('user_id', user.id);

      if (pauseError) {
        console.error('[Nudges] Error pausing nudging:', pauseError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Nudges] Error dismissing nudge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


