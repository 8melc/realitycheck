-- ============================================
-- DATABASE CHECK SCRIPT
-- Fuehre diese Queries in Supabase SQL-Console aus
-- ============================================

-- TAB 1: CHECK EXISTING TABLES
-- Zeigt alle Tabellen im public Schema
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
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
  is_published,
  created_at
FROM content_items 
WHERE is_published = true 
ORDER BY created_at DESC
LIMIT 10;

-- TAB 3: USER ACTIONS STATUS
-- Prueft ob user_actions Tabelle existiert
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_actions') 
    THEN 'EXISTS' 
    ELSE 'NOT FOUND' 
  END as table_status;

-- Falls user_actions existiert:
-- SELECT action, cluster, COUNT(*) as count
-- FROM user_actions 
-- GROUP BY action, cluster
-- ORDER BY count DESC;

-- Alternative: Pruefe guide_logs oder guide_turns (falls vorhanden)
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'guide_logs') 
    THEN 'guide_logs EXISTS' 
    ELSE 'guide_logs NOT FOUND' 
  END as guide_logs_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'guide_turns') 
    THEN 'guide_turns EXISTS' 
    ELSE 'guide_turns NOT FOUND' 
  END as guide_turns_status;

-- TAB 4: PROFILES SETTINGS
-- Korrigiert: user_profiles statt profiles
-- Pruefe ob guide_settings Spalte existiert
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND column_name LIKE '%guide%' OR column_name LIKE '%settings%'
ORDER BY column_name;

-- Zeige user_profiles mit relevanten Settings
SELECT 
  id,
  user_id,
  display_name,
  guide_personality,
  focus_topic,
  daily_time_limit_minutes,
  created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 5;

-- TAB 5: SLOTS STATUS
-- Pruefe ob slots Tabelle existiert
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'slots') 
    THEN 'EXISTS' 
    ELSE 'NOT FOUND' 
  END as table_status;

-- Falls slots existiert:
-- SELECT user_id, available, daily_limit 
-- FROM slots 
-- ORDER BY user_id
-- LIMIT 5;

-- Alternative: Slots sind in user_profiles gespeichert
SELECT 
  user_id,
  slots_article as article_available,
  slots_podcast as podcast_available,
  slots_quote as quote_available
FROM user_profiles
WHERE slots_article IS NOT NULL 
   OR slots_podcast IS NOT NULL 
   OR slots_quote IS NOT NULL
ORDER BY updated_at DESC
LIMIT 5;

-- ============================================
-- ZUSATZ: VOLLSTAENDIGE UEBERSICHT
-- ============================================

-- Alle Tabellen mit Zeilenanzahl
SELECT 
  schemaname,
  tablename,
  (SELECT COUNT(*) FROM pg_class c WHERE c.relname = t.tablename) as estimated_rows
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;

-- Content Items Statistiken
SELECT 
  'Content Items' as category,
  COUNT(*) as total,
  COUNT(CASE WHEN is_published = true THEN 1 END) as published,
  COUNT(CASE WHEN format = 'article' THEN 1 END) as articles,
  COUNT(CASE WHEN format = 'podcast' THEN 1 END) as podcasts,
  COUNT(CASE WHEN format = 'quote' THEN 1 END) as quotes
FROM content_items;

-- User Profiles Statistiken
SELECT 
  'User Profiles' as category,
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN guide_personality IS NOT NULL THEN 1 END) as with_personality,
  COUNT(CASE WHEN focus_topic IS NOT NULL THEN 1 END) as with_focus,
  COUNT(CASE WHEN slots_article IS NOT NULL THEN 1 END) as with_slots
FROM user_profiles;

