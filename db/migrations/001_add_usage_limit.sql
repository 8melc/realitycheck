-- Migration: Add Daily Usage Limit Feature
-- Created: 2025-10-25
-- Description: Adds session tracking and daily usage limit functionality

-- Create session_usage table for tracking user session time
CREATE TABLE IF NOT EXISTS session_usage (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    consumed_minutes INTEGER NOT NULL DEFAULT 0,
    limit_reached_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_usage_user_id ON session_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_session_usage_session_id ON session_usage(session_id);
CREATE INDEX IF NOT EXISTS idx_session_usage_started_at ON session_usage(started_at);

-- Add usage limit columns to users table (assuming it exists)
-- If users table doesn't exist, these will be added when the table is created
DO $$ 
BEGIN
    -- Add daily_usage_limit_minutes column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'daily_usage_limit_minutes') THEN
        ALTER TABLE users ADD COLUMN daily_usage_limit_minutes INTEGER;
    END IF;
    
    -- Add last_limit_update_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'last_limit_update_at') THEN
        ALTER TABLE users ADD COLUMN last_limit_update_at TIMESTAMPTZ;
    END IF;
    
    -- Add requires_reauth column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'requires_reauth') THEN
        ALTER TABLE users ADD COLUMN requires_reauth BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for session_usage table
DROP TRIGGER IF EXISTS update_session_usage_updated_at ON session_usage;
CREATE TRIGGER update_session_usage_updated_at
    BEFORE UPDATE ON session_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
-- INSERT INTO session_usage (user_id, session_id, consumed_minutes) 
-- VALUES ('test-user-1', 'session-1', 0);

COMMENT ON TABLE session_usage IS 'Tracks user session time and daily usage limits';
COMMENT ON COLUMN session_usage.user_id IS 'Reference to user ID';
COMMENT ON COLUMN session_usage.session_id IS 'Unique session identifier';
COMMENT ON COLUMN session_usage.consumed_minutes IS 'Total minutes consumed in this session';
COMMENT ON COLUMN session_usage.limit_reached_at IS 'Timestamp when daily limit was reached';
