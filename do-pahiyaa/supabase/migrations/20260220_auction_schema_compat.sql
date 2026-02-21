-- Auction schema compatibility patch
-- Aligns existing auctions table with bidding RPC + UI expectations while keeping backward compatibility.

ALTER TABLE public.auctions
    ADD COLUMN IF NOT EXISTS current_highest_bid NUMERIC(12, 2),
    ADD COLUMN IF NOT EXISTS highest_bidder_id UUID REFERENCES public.profiles(id),
    ADD COLUMN IF NOT EXISTS min_bid_increment NUMERIC(12, 2);

-- Backfill increment value for existing rows.
UPDATE public.auctions
SET min_bid_increment = COALESCE(min_bid_increment, min_increment, 1000)
WHERE min_bid_increment IS NULL;

-- Keep legacy column in sync for older code paths.
UPDATE public.auctions
SET min_increment = COALESCE(min_increment, min_bid_increment, 1000)
WHERE min_increment IS NULL;

-- Backfill current highest bid + highest bidder from existing bids.
WITH latest AS (
    SELECT DISTINCT ON (b.auction_id)
        b.auction_id,
        b.amount,
        b.bidder_id
    FROM public.bids b
    ORDER BY b.auction_id, b.amount DESC, b.created_at DESC
)
UPDATE public.auctions a
SET
    current_highest_bid = l.amount,
    highest_bidder_id = l.bidder_id
FROM latest l
WHERE a.id = l.auction_id
  AND (a.current_highest_bid IS NULL OR a.highest_bidder_id IS NULL);

-- Sync trigger to keep min_increment and min_bid_increment consistent.
CREATE OR REPLACE FUNCTION public.sync_auction_increment_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.min_bid_increment IS NULL THEN
            NEW.min_bid_increment := COALESCE(NEW.min_increment, 1000);
        END IF;
        IF NEW.min_increment IS NULL THEN
            NEW.min_increment := COALESCE(NEW.min_bid_increment, 1000);
        END IF;
    ELSE
        IF NEW.min_bid_increment IS DISTINCT FROM OLD.min_bid_increment THEN
            NEW.min_increment := NEW.min_bid_increment;
        ELSIF NEW.min_increment IS DISTINCT FROM OLD.min_increment THEN
            NEW.min_bid_increment := NEW.min_increment;
        ELSE
            NEW.min_bid_increment := COALESCE(NEW.min_bid_increment, NEW.min_increment, OLD.min_bid_increment, 1000);
            NEW.min_increment := COALESCE(NEW.min_increment, NEW.min_bid_increment, OLD.min_increment, 1000);
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_auction_increment_columns ON public.auctions;
CREATE TRIGGER trg_sync_auction_increment_columns
BEFORE INSERT OR UPDATE ON public.auctions
FOR EACH ROW
EXECUTE FUNCTION public.sync_auction_increment_columns();

CREATE INDEX IF NOT EXISTS idx_auctions_highest_bidder_id ON public.auctions (highest_bidder_id);
