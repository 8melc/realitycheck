-- CHECK: Was ist in deiner DB?
-- Fuehre diesen Query in deiner Supabase SQL-Console aus

-- 1. Gesamtuebersicht
SELECT 
  COUNT(*) as total_items,
  COUNT(CASE WHEN is_published = true THEN 1 END) as published_items,
  COUNT(CASE WHEN is_published = false OR is_published IS NULL THEN 1 END) as unpublished_items
FROM content_items;

-- 2. Nach Format gruppiert
SELECT 
  format,
  COUNT(*) as total_count,
  COUNT(CASE WHEN is_published = true THEN 1 END) as published_count
FROM content_items
GROUP BY format
ORDER BY total_count DESC;

-- 3. Nach Cluster/Thema gruppiert
SELECT 
  cluster,
  COUNT(*) as total_count,
  COUNT(CASE WHEN is_published = true THEN 1 END) as published_count,
  COUNT(CASE WHEN format = 'article' AND is_published = true THEN 1 END) as articles,
  COUNT(CASE WHEN format = 'podcast' AND is_published = true THEN 1 END) as podcasts,
  COUNT(CASE WHEN format = 'quote' AND is_published = true THEN 1 END) as quotes
FROM content_items
GROUP BY cluster
ORDER BY published_count DESC;

-- 4. Detaillierter Check: Zeige alle veroeffentlichten Items
SELECT 
  id,
  title,
  format,
  cluster,
  read_time_minutes,
  is_published,
  created_at
FROM content_items 
WHERE is_published = true
ORDER BY created_at DESC
LIMIT 10;

-- 5. Cluster + Format Kombination
SELECT 
  cluster,
  format,
  COUNT(*) as count
FROM content_items
WHERE is_published = true
GROUP BY cluster, format
ORDER BY cluster, count DESC;

