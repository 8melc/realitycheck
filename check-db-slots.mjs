import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  console.log('Checking user_profiles columns...');
  
  // Try to select the slots columns
  const { data, error } = await supabase
    .from('user_profiles')
    .select('slots_article, slots_podcast, slots_quote')
    .limit(1);

  if (error) {
    if (error.message.includes('column') && error.message.includes('does not exist')) {
      console.error('❌ FEHLER: Die Spalten für die Slots fehlen in der Datenbank!');
      console.log('Bitte führe folgendes SQL in Supabase aus:');
      console.log(`
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS slots_article INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS slots_podcast INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS slots_quote INTEGER DEFAULT 4;
      `);
    } else {
      console.error('Anderer DB Fehler:', error.message);
    }
  } else {
    console.log('✅ Erfolg: Die Spalten existieren in der Datenbank.');
    console.log('Aktuelle Werte (Beispiel):', data[0]);
  }
}

checkColumns();

