import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// GET: Retrieve user actions
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user actions
    const { data: actions, error: actionsError } = await supabase
      .from('user_actions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (actionsError) {
      console.error('[User Actions] Error fetching actions:', actionsError);
      return NextResponse.json({ error: 'Failed to fetch actions' }, { status: 500 });
    }
    
    return NextResponse.json(actions || []);
  } catch (error) {
    console.error('[User Actions] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create new action
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { title, category, due_date } = body;
    
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    // Insert new action
    const { data: newAction, error: insertError } = await supabase
      .from('user_actions')
      .insert({
        user_id: user.id,
        title: title.trim(),
        category: category || null,
        due_date: due_date || null,
        is_done: false,
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('[User Actions] Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create action' }, { status: 500 });
    }
    
    return NextResponse.json(newAction, { status: 201 });
  } catch (error) {
    console.error('[User Actions] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
