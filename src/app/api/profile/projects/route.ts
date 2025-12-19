import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// GET: Retrieve user projects
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user projects
    const { data: projects, error: projectsError } = await supabase
      .from('user_projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (projectsError) {
      console.error('[User Projects] Error fetching projects:', projectsError);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
    
    return NextResponse.json(projects || []);
  } catch (error) {
    console.error('[User Projects] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create new project
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { title, status, priority } = body;
    
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    // Insert new project
    const { data: newProject, error: insertError } = await supabase
      .from('user_projects')
      .insert({
        user_id: user.id,
        title: title.trim(),
        status: status || 'open',
        priority: priority || 5,
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('[User Projects] Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
    
    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('[User Projects] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
