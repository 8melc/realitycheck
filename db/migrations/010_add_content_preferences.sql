-- Migration: Add Content Preferences Table
-- Created: 2025-01-XX
-- Description: Creates content_preferences table for format prioritization and daily limits

CREATE TABLE IF NOT EXISTS public.content_preferences (
  user_id uuid NOT NULL,
  formats jsonb NULL DEFAULT '{"event": true, "quote": true, "article": true, "podcast": true}'::jsonb,
  clusters jsonb NULL DEFAULT '{"time": true, "focus": true, "culture": true, "meaning": true, "relationships": true}'::jsonb,
  max_articles_per_day integer NULL DEFAULT 3,
  max_podcasts_per_day integer NULL DEFAULT 2,
  max_quotes_per_day integer NULL DEFAULT 4,
  max_events_per_week integer NULL DEFAULT 2,
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT content_preferences_pkey PRIMARY KEY (user_id),
  CONSTRAINT content_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_content_preferences_updated_at
  BEFORE UPDATE ON content_preferences
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE content_preferences IS 'User preferences for content format prioritization and daily limits';
COMMENT ON COLUMN content_preferences.formats IS 'JSON object with format flags: {"article": true, "podcast": true, ...}';
COMMENT ON COLUMN content_preferences.clusters IS 'JSON object with cluster flags: {"time": true, "focus": true, ...}';
COMMENT ON COLUMN content_preferences.max_articles_per_day IS 'Maximum number of articles to show per day';
COMMENT ON COLUMN content_preferences.max_podcasts_per_day IS 'Maximum number of podcasts to show per day';
COMMENT ON COLUMN content_preferences.max_quotes_per_day IS 'Maximum number of quotes to show per day';
COMMENT ON COLUMN content_preferences.max_events_per_week IS 'Maximum number of events to show per week';


