-- Migration: Add session_id to guide_conversations
-- Created: 2025-01-XX
-- Description: Adds optional session_id column to guide_conversations for better session tracking

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'guide_conversations' AND column_name = 'session_id') THEN
        ALTER TABLE guide_conversations 
        ADD COLUMN session_id uuid;
        -- Optional: Can be used to group conversations by session
    END IF;
END $$;

-- Create index for session-based queries
CREATE INDEX IF NOT EXISTS idx_guide_conversations_session
  ON guide_conversations (session_id);

COMMENT ON COLUMN guide_conversations.session_id IS 'Optional session identifier for grouping conversations';


