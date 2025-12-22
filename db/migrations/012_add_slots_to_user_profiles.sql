-- Migration: Add slots_article, slots_podcast, slots_quote to user_profiles
-- Created: 2025-01-XX
-- Description: Adds content slot columns for article, podcast, and quote limits per day

DO $$ 
BEGIN
    -- Add slots_article column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'slots_article') THEN
        ALTER TABLE user_profiles 
        ADD COLUMN slots_article integer NULL DEFAULT 3;
    END IF;
    
    -- Add slots_podcast column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'slots_podcast') THEN
        ALTER TABLE user_profiles 
        ADD COLUMN slots_podcast integer NULL DEFAULT 2;
    END IF;
    
    -- Add slots_quote column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'slots_quote') THEN
        ALTER TABLE user_profiles 
        ADD COLUMN slots_quote integer NULL DEFAULT 4;
    END IF;
END $$;

COMMENT ON COLUMN user_profiles.slots_article IS 'Maximum number of articles to show per day (default: 3)';
COMMENT ON COLUMN user_profiles.slots_podcast IS 'Maximum number of podcasts to show per day (default: 2)';
COMMENT ON COLUMN user_profiles.slots_quote IS 'Maximum number of quotes to show per day (default: 4)';

