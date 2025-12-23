import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { 
  auth: { persistSession: false } 
});

async function run() {
  const email = 'sarah@test.com'; 
  const password = 'RealityCheck123';
  
  console.log(`Verarbeite User: ${email}...`);
  
  let userId;
  
  // 1. Versuch User zu erstellen
  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { display_name: 'Sarah Chen' },
    email_confirm: true
  });

  if (createError) {
    if (createError.code === 'email_exists' || createError.message.includes('already been registered')) {
      console.log('User existiert bereits, suche ID...');
      // Alle User listen und filtern (brute force für kleine Test-DBs)
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const user = users.find(u => u.email === email);
      if (!user) throw new Error('User existiert laut Error, aber listUsers findet ihn nicht.');
      userId = user.id;
    } else {
      throw createError;
    }
  } else {
    userId = createData.user.id;
    console.log('User neu erstellt:', userId);
  }

  console.log('User ID:', userId);

  // 2. Profil
  await supabase.from('user_profiles').upsert({
    user_id: userId,
    display_name: 'Sarah Chen',
    birth_date: '1992-03-12',
    target_age: 90,
    is_public: true,
    focus_topic: 'Digitale Souveränität',
    bio: 'Tech-Optimistin mit Fokus auf Zeit-Autonomie.',
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' });

  // 3. Ziel
  const { data: existingGoal } = await supabase
    .from('user_goals')
    .select('id')
    .eq('user_id', userId)
    .eq('is_primary', true)
    .maybeSingle();

  if (existingGoal) {
    console.log('Update existierendes Ziel...');
    await supabase.from('user_goals').update({
      title: 'Freiheit durch digitale Autonomie gewinnen',
      updated_at: new Date().toISOString()
    }).eq('id', existingGoal.id);
  } else {
    console.log('Erstelle neues Ziel...');
    await supabase.from('user_goals').insert({
      user_id: userId,
      title: 'Freiheit durch digitale Autonomie gewinnen',
      is_primary: true,
      status: 'active'
    });
  }

  console.log('Sarah Chen ist bereit!');
}

run().catch(console.error);


