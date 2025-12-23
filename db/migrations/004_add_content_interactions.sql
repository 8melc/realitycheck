-- Migration: Add Content Interactions Table
-- Created: 2025-01-XX
-- Description: Creates table for tracking user interactions with content items (likes, dislikes, pins, etc.)

CREATE TABLE IF NOT EXISTS content_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  interaction_type text NOT NULL,  -- 'like' | 'dislike' | 'pin' | 'completed' | 'skip'
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_interactions_user
  ON content_interactions (user_id);

CREATE INDEX IF NOT EXISTS idx_content_interactions_user_content
  ON content_interactions (user_id, content_id);

CREATE INDEX IF NOT EXISTS idx_content_interactions_content
  ON content_interactions (content_id);

CREATE INDEX IF NOT EXISTS idx_content_interactions_type
  ON content_interactions (interaction_type);

COMMENT ON TABLE content_interactions IS 'Tracks user interactions with content items (likes, dislikes, pins, completions, skips)';
COMMENT ON COLUMN content_interactions.user_id IS 'Reference to user ID';
COMMENT ON COLUMN content_interactions.content_id IS 'Reference to content item ID';
COMMENT ON COLUMN content_interactions.interaction_type IS 'Type of interaction: like, dislike, pin, completed, skip';



