import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { 
  auth: { persistSession: false } 
});

async function run() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  console.log('Total users:', users.length);
  users.forEach(u => console.log('-', u.email, u.id));
}

run();

