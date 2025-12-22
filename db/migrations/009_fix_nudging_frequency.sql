-- Migration: Fix nudging_frequency column
-- Created: 2025-01-XX
-- Description: Adds nudging_frequency column if it doesn't exist

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'nudging_frequency') THEN
        ALTER TABLE user_profiles 
        ADD COLUMN nudging_frequency text DEFAULT 'standard';
        -- Values: 'minimal' | 'standard' | 'frequent'
    END IF;
END $$;

-- Set default for existing users
UPDATE user_profiles
SET nudging_frequency = 'standard'
WHERE nudging_frequency IS NULL;

COMMENT ON COLUMN user_profiles.nudging_frequency IS 'Nudging frequency: minimal (1/day), standard (2-3/day), frequent (3-4/day)';

