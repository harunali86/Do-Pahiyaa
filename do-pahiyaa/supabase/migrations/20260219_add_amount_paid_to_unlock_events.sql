-- Add amount_paid column to unlock_events if it doesn't exist
ALTER TABLE unlock_events 
ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0;

-- Backfill existing rows with 0 or 1 if needed (optional, safe to default to 0)
-- UPDATE unlock_events SET amount_paid = 1 WHERE amount_paid IS NULL;
