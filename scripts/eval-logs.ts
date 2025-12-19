/**
 * Eval script for guide logs
 * Usage: npx tsx scripts/eval-logs.ts path/to/logs.jsonl
 */

import fs from 'fs';
import readline from 'readline';
import path from 'path';

type LogRecord = {
  uid_hash?: string;
  session_id?: string;
  prompt: string;
  response: string;
  slots_pre?: any;
  state_flags?: { no_content?: boolean };
};

type EvalResult = {
  uid_hash?: string;
  session_id?: string;
  violations: string[];
};

const EVAL_CHECKS: Record<string, (log: LogRecord) => boolean> = {
  autonomie: (log) => {
    // If no_content is true, we expect NO content suggestion
    if (log.state_flags?.no_content) return !mentionsContent(log.response);
    // Otherwise slots_pre must be available to suggest
    const slots = log.slots_pre;
    if (!slots) return true; // skip if unknown
    const available =
      (slots.article?.available ?? 0) +
      (slots.podcast?.available ?? 0) +
      (slots.quote?.available ?? 0);
    return available > 0 || !mentionsContent(log.response);
  },
  one_suggestion: (log) => {
    const mentions = log.response.match(/Artikel|Podcast|Zitat/gi)?.length || 0;
    return mentions <= 1;
  },
  transparency: (log) => {
    return /warum/i.test(log.response) || /passt/i.test(log.response);
  },
  tone_no_lists: (log) => {
    return !log.response.includes('- ') && !log.response.includes('* ');
  },
};

const mentionsContent = (text: string) => {
  return /Artikel|Podcast|Zitat/i.test(text);
};

async function parseJsonl(filePath: string): Promise<LogRecord[]> {
  const abs = path.resolve(filePath);
  const stream = fs.createReadStream(abs);
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  const rows: LogRecord[] = [];

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      rows.push(JSON.parse(trimmed));
    } catch (err) {
      console.error('Invalid JSON line, skipping:', trimmed);
    }
  }
  return rows;
}

async function writeEvalReport(results: EvalResult[], outFile: string) {
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`Eval report written to ${outFile}`);
}

async function runEval(jsonlFile: string) {
  const logs = await parseJsonl(jsonlFile);
  const violations = logs.map((log) => ({
    uid_hash: log.uid_hash,
    session_id: log.session_id,
    violations: Object.entries(EVAL_CHECKS)
      .filter(([, check]) => !check(log))
      .map(([name]) => name),
  }));

  const outFile = `eval-${new Date().toISOString().slice(0, 10)}.json`;
  await writeEvalReport(violations, outFile);
}

if (require.main === module) {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('Usage: npx tsx scripts/eval-logs.ts path/to/logs.jsonl');
    process.exit(1);
  }
  runEval(fileArg).catch((err) => {
    console.error('Eval failed', err);
    process.exit(1);
  });
}
