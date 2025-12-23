-- Migration: Add onboarding completion flags to user_profiles
-- Created: 2025-01-XX
-- Description: Adds flags to track onboarding progress

DO $$
BEGIN
    -- Add onboarding_completed flag
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_profiles' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE user_profiles
        ADD COLUMN onboarding_completed boolean DEFAULT false NOT NULL;
    END IF;

    -- Add phase-specific flags (optional, for detailed tracking)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_profiles' AND column_name = 'onboarding_phase_1_completed') THEN
        ALTER TABLE user_profiles
        ADD COLUMN onboarding_phase_1_completed boolean DEFAULT false NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_profiles' AND column_name = 'primary_goal_set') THEN
        ALTER TABLE user_profiles
        ADD COLUMN primary_goal_set boolean DEFAULT false NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_profiles' AND column_name = 'guide_preferences_set') THEN
        ALTER TABLE user_profiles
        ADD COLUMN guide_preferences_set boolean DEFAULT false NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'user_profiles' AND column_name = 'people_visibility_set') THEN
        ALTER TABLE user_profiles
        ADD COLUMN people_visibility_set boolean DEFAULT false NOT NULL;
    END IF;
END $$;

COMMENT ON COLUMN user_profiles.onboarding_completed IS 'True when user has completed the main onboarding flow';
COMMENT ON COLUMN user_profiles.onboarding_phase_1_completed IS 'True when user has completed Phase 1 (Identity)';
COMMENT ON COLUMN user_profiles.primary_goal_set IS 'True when user has set a primary goal';
COMMENT ON COLUMN user_profiles.guide_preferences_set IS 'True when user has set guide style preferences';
COMMENT ON COLUMN user_profiles.people_visibility_set IS 'True when user has set visibility preferences';

