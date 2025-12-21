import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    // Content-Item + Guide-Comment holen
    const { data: content } = await supabase
      .from('content_items')
      .select('title, guide_comment, transparency_reason')
      .eq('id', id)
      .single();

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    return NextResponse.json({
      title: content.title,
      guide_comment: content.guide_comment,
      transparency_reason: content.transparency_reason
    });

  } catch (error) {
    console.error('Guide comment error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

