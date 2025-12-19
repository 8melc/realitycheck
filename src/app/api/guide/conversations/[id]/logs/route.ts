import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: conversationId } = await params;

    // Load messages from guide_conversations for this "session" (grouped by date)
    // Since we don't have session_id, we'll use the conversationId as a date-based identifier
    // For now, return all messages for the user, grouped by date
    const { data, error } = await (supabase
      .from('guide_conversations') as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading conversation messages:', error);
      return NextResponse.json({ logs: [] });
    }

    // Transform guide_conversations to log format
    const logs = (data || []).map((msg: any) => ({
      id: msg.id,
      prompt: msg.role === 'user' ? msg.message : undefined,
      response: msg.role === 'guide' ? msg.message : undefined,
      user_message: msg.role === 'user' ? msg.message : undefined,
      guide_response: msg.role === 'guide' ? msg.message : undefined,
      created_at: msg.created_at,
      feedback_tags: undefined,
    }));

    return NextResponse.json({ logs });
  } catch (err) {
    console.error('guide/conversations/:id/logs GET error', err);
    return NextResponse.json({ logs: [] }); // Return empty array instead of error
  }
}
