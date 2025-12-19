-- ============================================
-- RLS POLICIES CHECK für feed_interactions
-- ============================================

-- 1. Pruefe ob RLS aktiviert ist
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'feed_interactions';

-- 2. Zeige alle Policies für feed_interactions
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'feed_interactions';

-- 3. Pruefe ob INSERT Policy existiert
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'feed_interactions' 
  AND cmd = 'INSERT';

-- 4. Test-Insert (wenn RLS blockt, wird Fehler geworfen)
-- Fuehre als authentifizierter User aus:
-- INSERT INTO feed_interactions (user_id, content_id, action)
-- VALUES ('test-user-id', 'test-content-id', 'saved');

-- 5. Erstelle Policy falls nicht vorhanden (Beispiel)
-- CREATE POLICY "Users can insert their own feed interactions"
-- ON feed_interactions
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (auth.uid() = user_id);
