-- Migration: Fix birth_date to be nullable
-- Created: 2025-01-XX
-- Description: birth_date should be nullable because it's set during onboarding, not at profile creation

DO $$ 
BEGIN
    -- Check if birth_date is currently NOT NULL
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'birth_date'
        AND is_nullable = 'NO'
    ) THEN
        -- Make birth_date nullable
        ALTER TABLE user_profiles
        ALTER COLUMN birth_date DROP NOT NULL;
        
        RAISE NOTICE 'birth_date is now nullable';
    ELSE
        RAISE NOTICE 'birth_date is already nullable';
    END IF;
END $$;

COMMENT ON COLUMN user_profiles.birth_date IS 'User birth date - set during onboarding, nullable until then';

