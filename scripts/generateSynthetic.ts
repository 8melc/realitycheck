/**
 * Generate 1000 synthetic FYF-like turns and insert into guide_logs
 * Usage: npx tsx scripts/generateSynthetic.ts
 * Requires Supabase URL/Key in env (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
 */

import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const FYF_TEMPLATES = {
  user: ['Weniger Chaos', 'Morgenroutine', 'Zeitmanagement', 'Sabbatical planen'],
  responses: ['Das ist tiefe Arbeit.', '15 Min. Lohnt sich oder skip.', 'Passt zu Ziel "Chaos reduzieren"']
};

const generate1000Turns = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase env vars');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const turns = [];
  for (let i = 0; i < 1000; i++) {
    turns.push({
      user_id: `synth-${i}`,
      session_id: randomUUID(),
      prompt: `User: ${FYF_TEMPLATES.user[i % 4]} | Slots: ${Math.floor(Math.random() * 3) + 1}`,
      response: FYF_TEMPLATES.responses[Math.floor(Math.random() * 3)],
      slots_pre: { available: Math.floor(Math.random() * 3) + 1 },
      slots_post: { available: Math.floor(Math.random() * 3) },
      state_flags: { no_content: false },
      created_at: new Date().toISOString(),
    });
  }

  const { error } = await supabase.from('guide_logs').insert(turns);
  if (error) {
    throw error;
  }
  console.log('✅ 1000 Synthetic FYF-Turns → EVAL READY');
};

if (require.main === module) {
  generate1000Turns().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
