import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('Checking content_items...');
  
  const { data, error } = await supabase
    .from('content_items')
    .select('id, title, cluster, is_published')
    .limit(20);

  if (error) {
    console.error('Error fetching data:', error);
    return;
  }

  console.log(`Total items fetched: ${data.length}`);
  console.log('Sample items:');
  data.forEach(item => {
    console.log(`- [${item.is_published ? 'PUB' : '---'}] ${item.cluster}: ${item.title}`);
  });

  const { data: counts, error: countError } = await supabase
    .from('content_items')
    .select('cluster, is_published')
    .then(({ data }) => {
      const counts = {};
      data?.forEach(item => {
        const key = `${item.cluster} (pub: ${item.is_published})`;
        counts[key] = (counts[key] || 0) + 1;
      });
      return { data: counts };
    });

  if (countError) {
    console.error('Error fetching counts:', countError);
    return;
  }

  console.log('\nCluster counts:');
  console.log(JSON.stringify(counts, null, 2));
}

checkData();

