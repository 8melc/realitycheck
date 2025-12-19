/**
 * Generate synthetic FYF-like turns for load/Eval testing (no PII)
 * Usage: npx tsx scripts/gen-synthetic-turns.ts > synthetic.jsonl
 */

import { writeFileSync } from 'fs';

const prompts = [
  'Was killt meinen Fokus?',
  'Zeig mir Content für heute.',
  'Ich will keinen Podcast, nur lesen.',
  'Sabbatical 2027 – was fehlt mir?',
  'Nur quatschen, kein Content.',
];

const responses = [
  'Du wirkst gestresst. Kein Content, nur Spiegeln. Was blockiert dich gerade?',
  'Nimm: Deep Work Essentials (Artikel, 8m). Das kostet 1 Slot. Warum: passt zu Fokus & Flow.',
  'Okay, kein Podcast. Was soll dir gerade am meisten helfen?',
  'Klingt nach Überlast. Ein Schritt: block 2h Deep Work. Warum: wichtig, nicht dringend.',
  'Verstanden. Ich halte die Klappe. Meld dich, wenn du wieder Content willst.',
];

const slotsOptions = [
  { article: { available: 2 }, podcast: { available: 1 }, quote: { available: 3 } },
  { article: { available: 0 }, podcast: { available: 0 }, quote: { available: 0 } },
];

const stateOptions = [
  { no_content: false },
  { no_content: true },
];

const codexVersion = 'v1.0';
const modelVersion = 'gpt-4o-mini';

const records = Array.from({ length: 1000 }).map((_, i) => {
  const prompt = prompts[i % prompts.length];
  const response = responses[i % responses.length];
  const slots = slotsOptions[i % slotsOptions.length];
  const state = stateOptions[i % stateOptions.length];
  return JSON.stringify({
    uid_hash: `synthetic-${i}`,
    session_id: `sess-${i}`,
    prompt,
    response,
    slots_pre: slots,
    state_flags: state,
    codex_version: codexVersion,
    model_version: modelVersion,
    created_at: new Date().toISOString(),
  });
});

writeFileSync('synthetic.jsonl', records.join('\n'), 'utf-8');
console.log('synthetic.jsonl written with 1000 turns');
