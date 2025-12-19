-- ============================================
-- FEED INTERACTIONS SQL CHECKS
-- ============================================

-- 1. Pruefe ob feed_interactions Tabelle existiert
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feed_interactions') 
    THEN 'EXISTS' 
    ELSE 'NOT FOUND' 
  END as table_status;

-- 2. Zeige alle Feed-Interaktionen
SELECT 
  id,
  user_id,
  content_id,
  action,
  created_at
FROM feed_interactions
ORDER BY created_at DESC
LIMIT 20;

-- 3. Statistiken nach Action
SELECT 
  action,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT content_id) as unique_items
FROM feed_interactions
GROUP BY action
ORDER BY count DESC;

-- 4. Statistiken nach User
SELECT 
  user_id,
  COUNT(*) as total_interactions,
  COUNT(CASE WHEN action = 'saved' THEN 1 END) as bookmarks,
  COUNT(CASE WHEN action = 'more_like_this' THEN 1 END) as more_like_this,
  COUNT(CASE WHEN action = 'different_topic' THEN 1 END) as different_topic,
  MAX(created_at) as last_interaction
FROM feed_interactions
GROUP BY user_id
ORDER BY total_interactions DESC
LIMIT 10;

-- 5. Statistiken nach Content-Item
SELECT 
  content_id,
  COUNT(*) as total_interactions,
  COUNT(CASE WHEN action = 'saved' THEN 1 END) as bookmarks,
  COUNT(CASE WHEN action = 'more_like_this' THEN 1 END) as more_like_this,
  COUNT(CASE WHEN action = 'different_topic' THEN 1 END) as different_topic
FROM feed_interactions
GROUP BY content_id
ORDER BY total_interactions DESC
LIMIT 10;

-- 6. Kombiniert: Content-Item + Cluster + Interaktionen
SELECT 
  ci.id as content_id,
  ci.title,
  ci.cluster,
  ci.format,
  COUNT(fi.id) as interaction_count,
  COUNT(CASE WHEN fi.action = 'saved' THEN 1 END) as bookmarks,
  COUNT(CASE WHEN fi.action = 'more_like_this' THEN 1 END) as more_like_this,
  COUNT(CASE WHEN fi.action = 'different_topic' THEN 1 END) as different_topic
FROM content_items ci
LEFT JOIN feed_interactions fi ON ci.id = fi.content_id
WHERE ci.is_published = true
GROUP BY ci.id, ci.title, ci.cluster, ci.format
HAVING COUNT(fi.id) > 0
ORDER BY interaction_count DESC
LIMIT 20;

-- 7. Interaktionen nach Cluster
SELECT 
  ci.cluster,
  COUNT(fi.id) as total_interactions,
  COUNT(CASE WHEN fi.action = 'saved' THEN 1 END) as bookmarks,
  COUNT(CASE WHEN fi.action = 'more_like_this' THEN 1 END) as more_like_this,
  COUNT(CASE WHEN fi.action = 'different_topic' THEN 1 END) as different_topic
FROM feed_interactions fi
JOIN content_items ci ON fi.content_id = ci.id
GROUP BY ci.cluster
ORDER BY total_interactions DESC;

-- 8. Letzte 24 Stunden
SELECT 
  action,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as unique_users
FROM feed_interactions
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY action
ORDER BY count DESC;

-- 9. User-Interaktionen Timeline
SELECT 
  DATE(created_at) as date,
  action,
  COUNT(*) as count
FROM feed_interactions
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), action
ORDER BY date DESC, action;
