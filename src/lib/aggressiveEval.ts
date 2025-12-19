/**
 * Aggressive Eval for FYF Guide
 * - Scores autonomy, single suggestion, transparency, tone
 * - Upserts eval_score + eval_checks into guide_logs
 * - CLI: npx tsx src/lib/aggressiveEval.ts (requires fetchRecentLogs + supabase client wiring)
 */

type EvalLog = {
  id?: string;
  response: string;
  state_flags?: { no_content?: boolean };
  slots_pre?: { available?: number };
};

// Placeholder: inject Supabase client & log fetcher when wiring in runtime
let supabase: any;
let fetchRecentLogs: () => Promise<EvalLog[]>;

export const setEvalDeps = (deps: { supabaseClient: any; fetcher: () => Promise<EvalLog[]> }) => {
  supabase = deps.supabaseClient;
  fetchRecentLogs = deps.fetcher;
};

export const runAggressiveEval = async (logs: EvalLog[]) => {
  if (!logs || logs.length === 0) {
    return { avg_score: 0, compliant: [] as any[] };
  }

  const results = logs.map((log) => {
    const checks = {
      autonomie:
        log.state_flags?.no_content === false && (log.slots_pre?.available ?? 0) > 0 ? 1 : 0,
      single_suggestion:
        ((log.response.match(/Artikel|Podcast|Zitat/g) || []).length <= 1) ? 1 : 0,
      transparency:
        (log.response.toLowerCase().includes('warum') ||
          log.response.toLowerCase().includes('passt')) ? 1 : 0,
      tone:
        (!log.response.includes('- ') &&
          !log.response.includes('* ') &&
          log.response.split('?').length <= 2) ? 1 : 0,
    };

    const score = (Object.values(checks).reduce((a, b) => a + b, 0)) / 4;

    return { ...log, eval_score: score, eval_checks: checks };
  });

  if (!supabase) {
    console.warn('Supabase client not set. Skipping upsert.');
    return {
      avg_score: results.reduce((a, b) => a + b.eval_score, 0) / results.length,
      compliant: results.filter((r) => r.eval_score >= 0.8),
    };
  }

  await supabase
    .from('guide_logs')
    .upsert(
      results.map((r) => ({
        id: r.id,
        eval_score: r.eval_score,
        eval_checks: r.eval_checks,
      }))
    );

  return {
    avg_score: results.reduce((a, b) => a + b.eval_score, 0) / results.length,
    compliant: results.filter((r) => r.eval_score >= 0.8),
  };
};

// Optional CLI runner
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    if (!fetchRecentLogs) {
      console.error('fetchRecentLogs not provided. Exiting.');
      process.exit(1);
    }
    const logs = await fetchRecentLogs();
    const result = await runAggressiveEval(logs);
    console.log(
      `33% TARGET: ${result.avg_score.toFixed(2)} | Compliant: ${result.compliant.length}/${logs.length}`
    );
  })();
}
