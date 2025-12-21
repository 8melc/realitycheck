-- ============================================
-- QUICK DATABASE CHECKS
-- Kopiere diese Queries in Supabase SQL-Console
-- ============================================

-- TAB 1: CHECK EXISTING TABLES
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- TAB 2: CONTENT ITEMS ANZEIGEN
-- Korrigiert: is_published statt published, read_time_minutes statt duration_min
SELECT 
  id, 
  title, 
  cluster, 
  format, 
  read_time_minutes as duration_min,
  is_published
FROM content_items 
WHERE is_published = true 
LIMIT 10;

-- TAB 3: USER ACTIONS STATUS
-- Prueft ob Tabelle existiert und zeigt Daten
SELECT 
  action, 
  cluster, 
  COUNT(*) as count
FROM user_actions 
GROUP BY action, cluster
ORDER BY count DESC;

-- Falls user_actions nicht existiert, pruefe guide_logs:
-- SELECT session_id, COUNT(*) as turn_count
-- FROM guide_logs
-- GROUP BY session_id
-- ORDER BY turn_count DESC
-- LIMIT 10;

-- TAB 4: PROFILES SETTINGS
-- Korrigiert: user_profiles statt profiles
SELECT 
  id, 
  user_id,
  display_name,
  guide_personality as guide_settings,
  focus_topic,
  daily_time_limit_minutes
FROM user_profiles 
LIMIT 3;

-- TAB 5: SLOTS STATUS
-- Prueft ob slots Tabelle existiert
SELECT 
  user_id, 
  available, 
  daily_limit 
FROM slots 
LIMIT 5;

-- Falls slots nicht existiert, nutze user_profiles:
-- SELECT 
--   user_id,
--   slots_article as available_article,
--   slots_podcast as available_podcast,
--   slots_quote as available_quote
-- FROM user_profiles
-- WHERE slots_article IS NOT NULL
-- LIMIT 5;

