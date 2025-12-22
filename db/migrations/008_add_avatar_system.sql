-- Add avatar system columns to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS avatar_type TEXT CHECK (avatar_type IN ('initials', 'upload', 'generated')),
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_seed TEXT,
ADD COLUMN IF NOT EXISTS avatar_style TEXT CHECK (avatar_style IN ('avataaars', 'personas', 'bottts', 'micah', 'lorelei'));

-- Set default avatar_type for existing users
UPDATE user_profiles
SET avatar_type = 'initials'
WHERE avatar_type IS NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_avatar_type ON user_profiles(avatar_type);

COMMENT ON COLUMN user_profiles.avatar_type IS 'Type of avatar: initials, upload, or generated';
COMMENT ON COLUMN user_profiles.avatar_url IS 'URL to uploaded avatar image in Supabase Storage';
COMMENT ON COLUMN user_profiles.avatar_seed IS 'Seed for generated avatars (email or UUID)';
COMMENT ON COLUMN user_profiles.avatar_style IS 'Style for generated avatars from DiceBear API';

