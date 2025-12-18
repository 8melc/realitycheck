-- Update testdemo@test.com Profil zu Melissa Conrads Demo-Profil
-- Führe dies in Supabase SQL Editor aus

-- Schritt 1: Finde die User-ID von testdemo@test.com
-- (Falls du einen anderen User verwenden willst, ändere die Email)
SELECT id, email FROM auth.users WHERE email = 'testdemo@test.com';

-- Schritt 2: Ersetze 'USER_ID_HIER' unten mit der User-ID aus Schritt 1
-- Dann führe die UPDATE-Statements aus:

-- Profil aktualisieren
UPDATE public.user_profiles
SET 
  display_name = 'Melissa Conrads',
  birth_date = '1997-08-08',
  target_age = 85,
  guide_personality = 'Ich will meine Zeit so investieren, dass sie Dividende für mein Leben zahlt.',
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'testdemo@test.com'
);

-- Goal aktualisieren oder erstellen
INSERT INTO public.user_goals (
  user_id,
  title,
  is_primary,
  status
)
SELECT 
  id,
  'Workation Winter 25/26, RealityCheck-Prototyp-Launch, Studienprojekt',
  true,
  'active'
FROM auth.users 
WHERE email = 'testdemo@test.com'
ON CONFLICT DO NOTHING;

-- Falls Goal bereits existiert, aktualisiere es
UPDATE public.user_goals
SET 
  title = 'Workation Winter 25/26, RealityCheck-Prototyp-Launch, Studienprojekt',
  updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'testdemo@test.com'
)
AND is_primary = true;

-- Prüfen ob es funktioniert hat
SELECT 
  up.user_id,
  up.display_name,
  up.birth_date,
  up.target_age,
  up.guide_personality,
  ug.title as goal_title,
  au.email
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
LEFT JOIN user_goals ug ON ug.user_id = up.user_id AND ug.is_primary = true
WHERE au.email = 'testdemo@test.com';
