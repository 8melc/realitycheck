-- Migration: Add observatory_onboarding_completed to user_profiles
-- This field tracks whether the user has completed the Observatory (People) onboarding flow

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS observatory_onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL;

-- Set default for existing users: false (they haven't completed the new onboarding)
UPDATE user_profiles
SET observatory_onboarding_completed = FALSE
WHERE observatory_onboarding_completed IS NULL;

-- Index for performance (filtering by observatory_onboarding_completed)
CREATE INDEX IF NOT EXISTS idx_user_profiles_observatory_onboarding_completed 
ON user_profiles(observatory_onboarding_completed);

-- Index for combined filtering (people list)
CREATE INDEX IF NOT EXISTS idx_user_profiles_public_observatory 
ON user_profiles(is_public, observatory_onboarding_completed) 
WHERE is_public = TRUE AND observatory_onboarding_completed = TRUE;

