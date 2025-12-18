import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { 
  auth: { persistSession: false } 
});

async function run() {
  const email = 'melissa@test.com';
  console.log(`Fixing profile for ${email}...`);
  
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === email);
  
  if (user) {
    console.log('User found:', user.id);
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        display_name: 'Melissa',
        birth_date: '1997-08-08',
        target_age: 85,
        is_public: true,
        focus_topic: 'RealityCheck Prototyp',
        bio: 'Fokus auf Zeit als Vermögen.',
        will_learn: ['AI', 'Philosophy'],
        will_share: ['UX Design', 'Strategy'],
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      
    if (profileError) {
      console.error('Profile Fix Error:', profileError);
    } else {
      console.log('Profile fixed successfully!');
    }
  } else {
    console.error('User not found.');
  }
}

run();
