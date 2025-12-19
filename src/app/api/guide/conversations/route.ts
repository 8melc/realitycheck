import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Load all messages from guide_conversations
    const { data: messages, error } = await (supabase
      .from('guide_conversations') as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading conversations:', error);
      return NextResponse.json({ conversations: [] });
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ conversations: [] });
    }

    // Group messages by date (same day = same session)
    const groupedByDate = messages.reduce((acc: any, msg: any) => {
      const date = new Date(msg.created_at).toDateString();
      if (!acc[date]) {
        acc[date] = {
          messages: [],
          firstMessage: msg,
          lastMessage: msg,
        };
      }
      acc[date].messages.push(msg);
      // Update last message if this is newer
      if (new Date(msg.created_at) > new Date(acc[date].lastMessage.created_at)) {
        acc[date].lastMessage = msg;
      }
      // Update first message if this is older
      if (new Date(msg.created_at) < new Date(acc[date].firstMessage.created_at)) {
        acc[date].firstMessage = msg;
      }
      return acc;
    }, {});

    // Convert to session format
    const conversations = Object.entries(groupedByDate).map(([date, group]: [string, any]) => {
      const userMessages = group.messages.filter((m: any) => m.role === 'user');
      const firstUserMessage = userMessages[userMessages.length - 1]; // Oldest user message (first in conversation)
      const title = firstUserMessage?.message 
        ? (firstUserMessage.message.length > 50 
            ? firstUserMessage.message.substring(0, 50) + '...' 
            : firstUserMessage.message)
        : 'Ohne Titel';
      
      // Count turns (user + guide pairs)
      const turnCount = Math.floor(group.messages.length / 2);

      return {
        id: date, // Use date as session ID
        created_at: group.firstMessage.created_at,
        updated_at: group.lastMessage.created_at,
        title,
        last_message_at: group.lastMessage.created_at,
        turn_count: turnCount,
        raw: group,
      };
    });

    // Sort by last_message_at descending (newest first)
    conversations.sort((a, b) => 
      new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    );

    return NextResponse.json({ conversations });
  } catch (err) {
    console.error('guide/conversations GET error', err);
    return NextResponse.json({ conversations: [] });
  }
}
