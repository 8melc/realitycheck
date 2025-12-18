-- SQL Script: Create Melissa Conrads Demo-Profil für People-Seite
-- Führe dies in Supabase SQL Editor aus

-- Schritt 1: Prüfe ob User existiert, oder erstelle einen
-- (Falls du schon einen User hast, überspringe Schritt 1)

-- Schritt 2: Hole die User-ID
-- Ersetze 'melissa.conrads@realitycheck.com' mit der Email deines Demo-Users
-- Oder nimm die User-ID von einem bestehenden User
SELECT id, email FROM auth.users WHERE email = 'melissa.conrads@realitycheck.com' OR email = 'testdemo@test.com';

-- Schritt 3: Ersetze 'USER_ID_HIER' mit der tatsächlichen User-ID aus Schritt 2
-- Dann führe diese INSERT-Statements aus:

-- Profil erstellen/aktualisieren
INSERT INTO public.user_profiles (
  user_id,
  display_name,
  birth_date,
  target_age,
  guide_personality
) VALUES (
  'USER_ID_HIER', -- ← Ersetze mit User-ID aus Schritt 2
  'Melissa Conrads',
  '1997-08-08',
  85,
  'Ich will meine Zeit so investieren, dass sie Dividende für mein Leben zahlt.'
)
ON CONFLICT (user_id) 
DO UPDATE SET
  display_name = EXCLUDED.display_name,
  birth_date = EXCLUDED.birth_date,
  target_age = EXCLUDED.target_age,
  guide_personality = EXCLUDED.guide_personality,
  updated_at = NOW();

-- Goal erstellen/aktualisieren
INSERT INTO public.user_goals (
  user_id,
  title,
  is_primary,
  status
) VALUES (
  'USER_ID_HIER', -- ← Gleiche User-ID
  'Workation Winter 25/26, RealityCheck-Prototyp-Launch, Studienprojekt',
  true,
  'active'
)
ON CONFLICT DO NOTHING;

-- Prüfen ob es funktioniert hat
SELECT 
  up.display_name,
  up.birth_date,
  up.target_age,
  up.guide_personality,
  ug.title as goal_title
FROM user_profiles up
LEFT JOIN user_goals ug ON ug.user_id = up.user_id AND ug.is_primary = true
WHERE up.user_id = 'USER_ID_HIER'; -- ← Gleiche User-ID
