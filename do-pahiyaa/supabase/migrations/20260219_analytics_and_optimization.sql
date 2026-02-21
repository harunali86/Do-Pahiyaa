-- Phase 15: Advanced Optimization (Analytics & Compression)

-- 1. Add Views to Listings
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- 2. Create RPC for atomic view increment (prevents race conditions)
-- Security: Allow public users to call this, but only to +1.
CREATE OR REPLACE FUNCTION public.increment_listing_view(listing_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER -- Run as owner to bypass RLS for this specific update
AS $$
BEGIN
  UPDATE public.listings
  SET views = views + 1
  WHERE id = listing_id;
END;
$$;

-- 3. Add Index for Sorting by Popularity
CREATE INDEX IF NOT EXISTS idx_listings_views ON public.listings(views DESC);
