import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/profile/session/start
 * 
 * Startet eine neue Session für den User
 * Erstellt einen neuen Eintrag in user_sessions mit session_start = now()
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prüfe, ob bereits eine offene Session existiert
    const { data: existingSession } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('user_id', user.id)
      .is('session_end', null)
      .order('session_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingSession) {
      // Es gibt bereits eine offene Session - gib diese zurück
      return NextResponse.json({ 
        sessionId: existingSession.id,
        message: 'Session already exists'
      });
    }

    // Erstelle neue Session
    const now = new Date();
    const { data: newSession, error: insertError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        session_start: now.toISOString(),
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[Session Start] Error creating session:', insertError);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json({ 
      sessionId: newSession.id,
      startedAt: now.toISOString()
    });
  } catch (error) {
    console.error('[Session Start] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
