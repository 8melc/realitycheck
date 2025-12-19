/**
 * Runner for aggressive eval (pulls recent logs, runs checks, writes eval_score)
 * Usage: npx tsx scripts/run-aggressive-eval.ts
 * Env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { runAggressiveEval, setEvalDeps } from '@/lib/aggressiveEval';

const fetchRecentLogs = async (supabase: any) => {
  const since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(); // last 6h
  const { data, error } = await supabase
    .from('guide_logs')
    .select('id, response, slots_pre, state_flags')
    .gte('created_at', since)
    .limit(2000);
  if (error) {
    throw error;
  }
  return data || [];
};

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase env vars');
  }
  const supabase = createClient(url, key);

  setEvalDeps({
    supabaseClient: supabase,
    fetcher: () => fetchRecentLogs(supabase),
  });

  const logs = await fetchRecentLogs(supabase);
  const result = await runAggressiveEval(logs);
  console.log(
    `EVAL: avg=${result.avg_score.toFixed(2)} compliant=${result.compliant.length}/${logs.length}`
  );
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
