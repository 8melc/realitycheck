/**
 * Database Check Script
 * Fuehrt alle DB-Checks durch (Tabellen, Content Items, User Actions, Profiles, Slots)
 * 
 * Usage: node check-db-all.mjs
 * 
 * Laedt Environment-Variablen aus .env.local oder .env
 */

// Load .env.local or .env file manually
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvFile(filename) {
  try {
    const envPath = join(__dirname, filename);
    const content = readFileSync(envPath, 'utf-8');
    const env = {};
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          env[key.trim()] = value.trim();
        }
      }
    });
    return env;
  } catch (e) {
    return {};
  }
}

// Load env files
const envLocal = loadEnvFile('.env.local');
const env = loadEnvFile('.env');

// Merge: .env.local overrides .env, process.env overrides both
const allEnv = { ...env, ...envLocal, ...process.env };

const SUPABASE_URL = allEnv.SUPABASE_URL || allEnv.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = allEnv.SUPABASE_ANON_KEY || allEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Fehlende Environment-Variablen');
  console.log('Setze SUPABASE_URL und SUPABASE_ANON_KEY');
  process.exit(1);
}

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

async function fetchQuery(table, select = '*', filters = '', limit = null) {
  let url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}`;
  if (filters) url += `&${filters}`;
  if (limit) url += `&limit=${limit}`;
  
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      return { error: `HTTP ${response.status}`, data: null };
    }
    return { error: null, data: await response.json() };
  } catch (error) {
    return { error: error.message, data: null };
  }
}

async function checkTableExists(tableName) {
  // Pruefe ueber Supabase Meta-API oder direkte Query
  const { error } = await fetchQuery(tableName, 'id', 'limit=1');
  return !error;
}

console.log('🔍 DATABASE CHECK - Alle Tabellen & Daten\n');
console.log('='.repeat(60));

// TAB 1: CHECK EXISTING TABLES
console.log('\n📋 TAB 1: EXISTING TABLES');
console.log('-'.repeat(60));

const tables = [
  'content_items',
  'user_profiles',
  'user_goals',
  'user_actions',
  'slots',
  'guide_logs',
  'guide_turns',
  'codex_snippets',
];

for (const table of tables) {
  const exists = await checkTableExists(table);
  console.log(`  ${exists ? '✅' : '❌'} ${table}`);
}

// TAB 2: CONTENT ITEMS
console.log('\n📦 TAB 2: CONTENT ITEMS');
console.log('-'.repeat(60));

const { data: contentItems, error: contentError } = await fetchQuery(
  'content_items',
  'id,title,cluster,format,read_time_minutes,is_published,created_at',
  'is_published=eq.true',
  10
);

if (contentError) {
  console.log(`  ❌ Fehler: ${contentError}`);
} else {
  console.log(`  ✅ Gefunden: ${contentItems?.length || 0} Items\n`);
  contentItems?.slice(0, 5).forEach((item, i) => {
    console.log(`  ${i + 1}. [${item.format}] ${item.title.substring(0, 50)}...`);
    console.log(`     Cluster: ${item.cluster}, Dauer: ${item.read_time_minutes}min`);
  });
}

// TAB 3: USER ACTIONS STATUS
console.log('\n🎯 TAB 3: USER ACTIONS STATUS');
console.log('-'.repeat(60));

const userActionsExists = await checkTableExists('user_actions');
if (userActionsExists) {
  const { data: actions, error: actionsError } = await fetchQuery(
    'user_actions',
    'action,cluster',
    '',
    100
  );
  
  if (actionsError) {
    console.log(`  ❌ Fehler: ${actionsError}`);
  } else if (actions && actions.length > 0) {
    const grouped = {};
    actions.forEach(a => {
      const key = `${a.action || 'unknown'}_${a.cluster || 'unknown'}`;
      grouped[key] = (grouped[key] || 0) + 1;
    });
    
    console.log(`  ✅ Gefunden: ${actions.length} Actions\n`);
    Object.entries(grouped).forEach(([key, count]) => {
      const [action, cluster] = key.split('_');
      console.log(`  ${action} / ${cluster}: ${count}`);
    });
  } else {
    console.log('  ⚠️  Tabelle existiert, aber keine Daten');
  }
} else {
  console.log('  ❌ Tabelle user_actions existiert nicht');
  
  // Pruefe alternative Tabellen
  const guideLogsExists = await checkTableExists('guide_logs');
  const guideTurnsExists = await checkTableExists('guide_turns');
  console.log(`  ${guideLogsExists ? '✅' : '❌'} guide_logs`);
  console.log(`  ${guideTurnsExists ? '✅' : '❌'} guide_turns`);
}

// TAB 4: PROFILES SETTINGS
console.log('\n👤 TAB 4: PROFILES SETTINGS');
console.log('-'.repeat(60));

// Try with minimal columns first
const { data: profiles, error: profilesError } = await fetchQuery(
  'user_profiles',
  '*',
  '',
  5
);

if (profilesError) {
  console.log(`  ❌ Fehler: ${profilesError}`);
  console.log(`  ℹ️  Mögliche Ursachen: RLS aktiviert oder Tabelle nicht zugänglich`);
  
  // Try alternative: check if table exists via slots query
  const { data: slotProfiles } = await fetchQuery(
    'user_profiles',
    'user_id,slots_article,slots_podcast,slots_quote,display_name',
    'slots_article.is.not.null',
    3
  );
  
  if (slotProfiles && slotProfiles.length > 0) {
    console.log(`  ✅ Tabelle existiert, aber RLS blockiert vollständigen Zugriff`);
    console.log(`  ✅ Gefunden: ${slotProfiles.length} Profiles (via Slots-Query)\n`);
    slotProfiles.forEach((profile, i) => {
      console.log(`  ${i + 1}. ${profile.display_name || 'Unbekannt'} (${profile.user_id.substring(0, 8)}...)`);
      console.log(`     Slots: Article=${profile.slots_article}, Podcast=${profile.slots_podcast}, Quote=${profile.slots_quote}`);
    });
  }
} else {
  console.log(`  ✅ Gefunden: ${profiles?.length || 0} Profiles\n`);
  profiles?.forEach((profile, i) => {
    console.log(`  ${i + 1}. ${profile.display_name || 'Unbekannt'} (${profile.user_id?.substring(0, 8) || 'N/A'}...)`);
    console.log(`     Personality: ${profile.guide_personality || '—'}`);
    console.log(`     Focus: ${profile.focus_topic || '—'}`);
    console.log(`     Time Limit: ${profile.daily_time_limit_minutes || '—'} min`);
  });
}

// TAB 5: SLOTS STATUS
console.log('\n🎰 TAB 5: SLOTS STATUS');
console.log('-'.repeat(60));

const slotsExists = await checkTableExists('slots');
if (slotsExists) {
  const { data: slots, error: slotsError } = await fetchQuery(
    'slots',
    'user_id,available,daily_limit',
    '',
    5
  );
  
  if (slotsError) {
    console.log(`  ❌ Fehler: ${slotsError}`);
  } else {
    console.log(`  ✅ Gefunden: ${slots?.length || 0} Slot-Eintraege\n`);
    slots?.forEach((slot, i) => {
      console.log(`  ${i + 1}. User: ${slot.user_id.substring(0, 8)}...`);
      console.log(`     Available: ${slot.available}, Limit: ${slot.daily_limit}`);
    });
  }
} else {
  console.log('  ❌ Tabelle slots existiert nicht');
  console.log('  ℹ️  Pruefe Slots in user_profiles...\n');
  
  const { data: profileSlots, error: profileSlotsError } = await fetchQuery(
    'user_profiles',
    'user_id,slots_article,slots_podcast,slots_quote',
    'slots_article.is.not.null,slots_podcast.is.not.null,slots_quote.is.not.null',
    5
  );
  
  if (profileSlotsError) {
    console.log(`  ❌ Fehler: ${profileSlotsError}`);
  } else if (profileSlots && profileSlots.length > 0) {
    console.log(`  ✅ Slots in user_profiles gefunden: ${profileSlots.length}\n`);
    profileSlots.forEach((p, i) => {
      console.log(`  ${i + 1}. User: ${p.user_id.substring(0, 8)}...`);
      console.log(`     Article: ${p.slots_article}, Podcast: ${p.slots_podcast}, Quote: ${p.slots_quote}`);
    });
  } else {
    console.log('  ⚠️  Keine Slots in user_profiles gefunden');
  }
}

console.log('\n' + '='.repeat(60));
console.log('✅ Check abgeschlossen\n');


