-- Migration: Add music_taste, lifestyle, interests to user_profiles
-- Created: 2025-01-XX
-- Description: Adds fields for music taste, lifestyle, and interests from onboarding

DO $$ 
BEGIN
    -- Add music_taste column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'music_taste') THEN
        ALTER TABLE user_profiles 
        ADD COLUMN music_taste text NULL;
    END IF;
    
    -- Add lifestyle column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'lifestyle') THEN
        ALTER TABLE user_profiles 
        ADD COLUMN lifestyle text NULL;
    END IF;
    
    -- Add interests column (array of strings)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'interests') THEN
        ALTER TABLE user_profiles 
        ADD COLUMN interests text[] NULL;
    END IF;
END $$;

COMMENT ON COLUMN user_profiles.music_taste IS 'User music taste preference from onboarding: electronic, hiphop, rock, jazz, classical, ambient, pop, indie';
COMMENT ON COLUMN user_profiles.lifestyle IS 'User lifestyle preference from onboarding: digital-nomad, remote-worker, office-player, hybrid, creator, sidepreneur, explorer, caretaker, teamplayer, rebel, family-flow, minimalist, old-school';
COMMENT ON COLUMN user_profiles.interests IS 'Array of user interests from onboarding';

