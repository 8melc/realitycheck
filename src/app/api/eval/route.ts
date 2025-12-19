import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /api/eval
 * Calls Supabase RPC run_aggressive_eval and returns dashboard metrics
 * Requires SQL function:
 *   CREATE OR REPLACE FUNCTION run_aggressive_eval() RETURNS jsonb AS $$
 *   ...
 *   $$ LANGUAGE plpgsql;
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc('run_aggressive_eval');

    if (error) {
      console.error('run_aggressive_eval error', error);
      return NextResponse.json({ error: 'RPC failed' }, { status: 500 });
    }

    // Return dashboard metrics without target_33/next_improvement
    return NextResponse.json({
      status: 'Eval Dashboard',
      ...(data || {}),
    });
  } catch (err) {
    console.error('eval api error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
