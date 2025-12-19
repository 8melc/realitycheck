import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// GET: Retrieve user interests
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user interests
    const { data: interests, error: interestsError } = await supabase
      .from('user_interests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (interestsError) {
      console.error('[User Interests] Error fetching interests:', interestsError);
      return NextResponse.json({ error: 'Failed to fetch interests' }, { status: 500 });
    }
    
    return NextResponse.json(interests || []);
  } catch (error) {
    console.error('[User Interests] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create new interest
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { label } = body;
    
    if (!label || !label.trim()) {
      return NextResponse.json({ error: 'Label is required' }, { status: 400 });
    }
    
    // Insert new interest
    const { data: newInterest, error: insertError } = await supabase
      .from('user_interests')
      .insert({
        user_id: user.id,
        label: label.trim(),
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('[User Interests] Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create interest' }, { status: 500 });
    }
    
    return NextResponse.json(newInterest, { status: 201 });
  } catch (error) {
    console.error('[User Interests] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete interest
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Interest ID is required' }, { status: 400 });
    }
    
    // Delete interest (only if owned by user)
    const { error: deleteError } = await supabase
      .from('user_interests')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (deleteError) {
      console.error('[User Interests] Delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete interest' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[User Interests] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
