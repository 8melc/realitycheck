-- Migration: Allow public read access to user_profiles for People page
-- This policy allows anyone (authenticated or not) to read user_profiles
-- that have display_name, birth_date, and target_age set

-- Drop existing policy if it exists (optional, adjust name if needed)
-- DROP POLICY IF EXISTS "anyone_can_read_public_profiles" ON public.user_profiles;

-- Create policy to allow reading all user_profiles
-- This is needed for the /people page to display all profiles
CREATE POLICY "anyone_can_read_public_profiles"
ON public.user_profiles
FOR SELECT
USING (
  display_name IS NOT NULL 
  AND birth_date IS NOT NULL 
  AND target_age IS NOT NULL
);

-- Alternative: If you want to allow reading ALL profiles (even incomplete ones):
-- CREATE POLICY "anyone_can_read_all_profiles"
-- ON public.user_profiles
-- FOR SELECT
-- USING (true);

-- Note: This policy makes profiles publicly readable.
-- If you need more privacy, consider:
-- 1. Adding a `is_public` boolean field to user_profiles
-- 2. Only allowing profiles with `is_public = true` to be read
-- 3. Or requiring authentication and showing only profiles of users who opted in


