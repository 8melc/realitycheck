import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// GET: Retrieve guide conversations
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get guide conversations
    const { data: conversations, error: conversationsError } = await supabase
      .from('guide_conversations')
      .select('id, role, message, created_at, session_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }) // Ascending for proper pairing (user then guide)
      .limit(50); // Increased limit to get more conversation pairs
    
    if (conversationsError) {
      console.error('[Guide Conversations] Error fetching conversations:', {
        error: conversationsError,
        code: conversationsError.code,
        message: conversationsError.message,
        details: conversationsError.details,
        hint: conversationsError.hint,
        user_id: user.id
      });
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }
    
    console.log('[Guide Conversations] Fetched conversations:', {
      count: conversations?.length || 0,
      user_id: user.id,
      sample: conversations?.slice(0, 3).map((c: any) => ({
        id: c.id,
        role: c.role,
        session_id: c.session_id,
        created_at: c.created_at,
        message_preview: c.message?.substring(0, 50)
      }))
    });
    
    return NextResponse.json(conversations || []);
  } catch (error) {
    console.error('[Guide Conversations] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
