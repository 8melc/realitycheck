import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /api/guide/messages
 * Get all messages for a specific session
 * 
 * Query params:
 *   - sessionId (required): The session ID to load messages for
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!sessionId) {
      return NextResponse.json({ messages: [] });
    }

    const { data, error } = await supabase
      .from('guide_conversations')
      .select('id, role, message, created_at')
      .eq('user_id', user.id)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Guide Messages] Error:', error);
      return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 });
    }

    return NextResponse.json({ messages: data || [] });
  } catch (error: any) {
    console.error('[Guide Messages] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



