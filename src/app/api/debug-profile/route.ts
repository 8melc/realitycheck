import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' });
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    return NextResponse.json({
      user_id: user.id,
      email: user.email,
      profile,
      error
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}


