import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { logFeedback } from '@/lib/feedback';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, cluster, itemId } = body || {};

    if (!type) {
      return NextResponse.json({ error: 'Missing feedback type' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await logFeedback(supabase, user.id, { type, cluster, itemId });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('guide/feedback error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
