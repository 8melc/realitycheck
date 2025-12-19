import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// GET: Retrieve journey events
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get journey events
    const { data: events, error: eventsError } = await supabase
      .from('user_journey_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (eventsError) {
      console.error('[Journey] Error fetching events:', eventsError);
      return NextResponse.json({ error: 'Failed to fetch journey events' }, { status: 500 });
    }
    
    return NextResponse.json(events || []);
  } catch (error) {
    console.error('[Journey] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
