import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/profile/session/end
 * 
 * Beendet die letzte offene Session des Users
 * Findet Session mit session_end is null und setzt session_end + duration_minutes
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Finde die letzte offene Session des Users
    const { data: openSession, error: findError } = await supabase
      .from('user_sessions')
      .select('id, session_start')
      .eq('user_id', user.id)
      .is('session_end', null)
      .order('session_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) {
      console.error('[Session End] Error finding session:', findError);
      return NextResponse.json({ error: 'Failed to find session' }, { status: 500 });
    }

    if (!openSession) {
      // Keine offene Session gefunden
      return NextResponse.json({ 
        success: true,
        message: 'No open session found'
      });
    }

    // Berechne duration_minutes
    const now = new Date();
    const sessionStart = new Date(openSession.session_start);
    const durationMs = now.getTime() - sessionStart.getTime();
    const durationMinutes = Math.round(durationMs / (1000 * 60));

    // Update Session
    const { error: updateError } = await supabase
      .from('user_sessions')
      .update({
        session_end: now.toISOString(),
        duration_minutes: durationMinutes,
      })
      .eq('id', openSession.id)
      .eq('user_id', user.id); // Sicherheit: Nur eigene Sessions updaten

    if (updateError) {
      console.error('[Session End] Error updating session:', updateError);
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      sessionId: openSession.id,
      durationMinutes
    });
  } catch (error) {
    console.error('[Session End] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
