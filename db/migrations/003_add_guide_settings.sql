-- Migration: Add Guide Settings (answer_style, guide_tone)
-- Created: 2025-01-XX
-- Description: Adds answer style and guide tone preferences to user_profiles

-- Add answer_style column to user_profiles
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'answer_style') THEN
        ALTER TABLE user_profiles 
        ADD COLUMN answer_style text DEFAULT 'medium';
        -- Values: 'short' | 'medium' | 'long'
    END IF;
    
    -- Add guide_tone column to user_profiles (optional)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'guide_tone') THEN
        ALTER TABLE user_profiles 
        ADD COLUMN guide_tone text DEFAULT 'Straight';
        -- Values: 'Soft Touch' | 'Straight' | 'Hard Truth'
    END IF;
    
    -- Add focus_window column to user_profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'focus_window') THEN
        ALTER TABLE user_profiles 
        ADD COLUMN focus_window text DEFAULT 'evening';
        -- Values: 'morning' | 'afternoon' | 'evening' | 'late_night'
    END IF;
END $$;

COMMENT ON COLUMN user_profiles.answer_style IS 'Preferred answer length: short (250 tokens), medium (450 tokens), long (800 tokens)';
COMMENT ON COLUMN user_profiles.guide_tone IS 'Preferred guide tone: Soft Touch, Straight, Hard Truth';
COMMENT ON COLUMN user_profiles.focus_window IS 'Preferred time window for content recommendations: morning, afternoon, evening, late_night';

