import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/session/end
 * 
 * Beendet eine Session synchron (wird von sendBeacon beim Tab-Close aufgerufen)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, sessionEnd, durationMinutes } = body;

    if (!sessionId || !sessionEnd || durationMinutes === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update Session in DB
    const { error: updateError } = await supabase
      .from('user_sessions')
      .update({
        session_end: sessionEnd,
        duration_minutes: durationMinutes,
      })
      .eq('id', sessionId)
      .eq('user_id', user.id); // Sicherheit: Nur eigene Sessions updaten

    if (updateError) {
      console.error('[Session End] Error updating session:', updateError);
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Session End] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
