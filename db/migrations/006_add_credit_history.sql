-- Migration: Add Credit History Table
-- Created: 2025-01-20
-- Description: Tracks all credit transactions (earned, spent, purchased) for transparency

-- Create credit_history table
CREATE TABLE IF NOT EXISTS credit_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,        -- negative bei Verbrauch, positiv bei Kauf/Gutschrift
  balance_after integer NOT NULL, -- Kontostand nach der Transaktion
  reason text NOT NULL,           -- 'extend_session', 'guide_message', 'content_open', 'purchase', 'earned', etc.
  meta jsonb,                      -- optional: { session_id, content_id, guide_message_id, ... }
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_credit_history_user_created 
  ON credit_history (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_history_reason 
  ON credit_history (reason);

-- Add comment for documentation
COMMENT ON TABLE credit_history IS 'Tracks all credit transactions for transparency and user history';
COMMENT ON COLUMN credit_history.amount IS 'Negative for spending, positive for earning/purchasing';
COMMENT ON COLUMN credit_history.reason IS 'Type of transaction: extend_session, guide_message, content_open, purchase, earned, etc.';
COMMENT ON COLUMN credit_history.meta IS 'Optional JSON metadata: session_id, content_id, guide_message_id, etc.';

