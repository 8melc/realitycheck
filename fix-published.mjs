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

async function fixData() {
  console.log('Fixing content_items: setting is_published = true where it is null...');
  
  const { data, error } = await supabase
    .from('content_items')
    .update({ is_published: true })
    .is('is_published', null)
    .select();

  if (error) {
    console.error('Error fixing data:', error);
    return;
  }

  console.log(`Updated ${data?.length || 0} items.`);

  // Also check if any are false
  const { count, error: countError } = await supabase
    .from('content_items')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', false);

  if (countError) {
    console.error('Error checking false items:', countError);
  } else {
    console.log(`There are still ${count} items with is_published = false.`);
  }
}

fixData();
