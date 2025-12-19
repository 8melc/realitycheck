import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function DELETE(_req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all conversations for this user
    // RLS ensures user can only delete their own messages
    const { error } = await (supabase
      .from('guide_conversations') as any)
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Delete all conversations error:', error);
      throw error;
    }

    return NextResponse.json({ success: true, deleted: true });
    
  } catch (error) {
    console.error('Delete all conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to delete all conversations' },
      { status: 500 }
    );
  }
}
