-- Test User Account: testuser@realitycheck.com
-- Password: test123!

-- 1. Auth User erstellen (in Supabase Dashboard: Authentication > Users > Add User)
-- Oder via Signup-Flow: /signup mit testuser@realitycheck.com / test123!

-- 2. Nach User-Erstellung: User-ID aus auth.users holen
-- SELECT id, email FROM auth.users WHERE email = 'testuser@realitycheck.com';

-- 3. User Profile erstellen (ersetze 'USER_ID_HIER' mit der tatsächlichen User-ID)
INSERT INTO public.user_profiles (
  user_id,
  display_name,
  birth_date,
  target_age,
  guide_personality,
  created_at,
  updated_at
) VALUES (
  'USER_ID_HIER', -- ← Ersetze mit User-ID aus Schritt 2
  'Test User',
  '1990-01-15',
  80,
  'Zeit als Investition',
  NOW(),
  NOW()
);

-- 4. Optional: Primary Goal erstellen
INSERT INTO public.user_goals (
  user_id,
  title,
  is_primary,
  status,
  created_at,
  updated_at
) VALUES (
  'USER_ID_HIER', -- ← Ersetze mit User-ID aus Schritt 2
  'RealityCheck erfolgreich testen',
  true,
  'active',
  NOW(),
  NOW()
);

-- 5. Prüfen ob alles erstellt wurde
-- SELECT 
--   up.display_name,
--   up.birth_date,
--   up.target_age,
--   up.guide_personality,
--   ug.title as goal_title
-- FROM user_profiles up
-- LEFT JOIN user_goals ug ON ug.user_id = up.user_id AND ug.is_primary = true
-- WHERE up.user_id = 'USER_ID_HIER';

