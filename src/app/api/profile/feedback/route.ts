import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// GET: Retrieve guide feedback
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get guide feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from('guide_feedback')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (feedbackError) {
      console.error('[Guide Feedback] Error fetching feedback:', feedbackError);
      return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
    }
    
    return NextResponse.json(feedback || []);
  } catch (error) {
    console.error('[Guide Feedback] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
