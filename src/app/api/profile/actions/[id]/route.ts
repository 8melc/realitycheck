import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// PATCH: Update action
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const body = await req.json();
    const { is_done, title, category, due_date } = body;
    
    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };
    
    if (is_done !== undefined) {
      updateData.is_done = is_done;
    }
    
    if (title !== undefined) {
      updateData.title = title.trim();
    }
    
    if (category !== undefined) {
      updateData.category = category;
    }
    
    if (due_date !== undefined) {
      updateData.due_date = due_date;
    }
    
    // Update action (only if owned by user)
    const { data: updatedAction, error: updateError } = await supabase
      .from('user_actions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Action not found' }, { status: 404 });
      }
      console.error('[User Actions] Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update action' }, { status: 500 });
    }
    
    return NextResponse.json(updatedAction);
  } catch (error) {
    console.error('[User Actions] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete action
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    
    // Delete action (only if owned by user)
    const { error: deleteError } = await supabase
      .from('user_actions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    
    if (deleteError) {
      console.error('[User Actions] Delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete action' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[User Actions] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
