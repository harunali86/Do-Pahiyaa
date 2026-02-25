-- Phase 17.5: Fix Listing RLS for Authenticated Users
-- Specifically adding the missing FOR INSERT policy so users can create their own listings

BEGIN;

-- Ensure RLS is active (should already be from previous migrations)
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Drop just in case it exists to avoid errors
DROP POLICY IF EXISTS "Authenticated users can create listings" ON public.listings;

-- Add the missing INSERT policy
CREATE POLICY "Authenticated users can create listings" 
ON public.listings 
FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

COMMIT;
