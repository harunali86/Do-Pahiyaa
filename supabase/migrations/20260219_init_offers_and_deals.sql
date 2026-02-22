-- 1. Create Offers Table
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES public.listings(id) NOT NULL,
    buyer_id UUID REFERENCES public.profiles(id) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending', -- pending, accepted, rejected, expired
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Deals Table (The Post-Offer Workflow)
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    offer_id UUID REFERENCES public.offers(id) NOT NULL,
    buyer_id UUID REFERENCES public.profiles(id) NOT NULL,
    listing_id UUID REFERENCES public.listings(id) NOT NULL,
    status TEXT DEFAULT 'contact_locked', -- contact_locked, contact_unlocked, token_paid, closed
    is_inspection_requested BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS for Offers
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create offers" ON public.offers
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can view own offers" ON public.offers
    FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view offers on own listings" ON public.offers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.listings 
            WHERE id = offers.listing_id AND seller_id = auth.uid()
        )
    );

-- 4. RLS for Deals
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deals viewable by buyer and seller" ON public.deals
    FOR SELECT USING (
        auth.uid() = buyer_id OR 
        EXISTS (
            SELECT 1 FROM public.listings 
            WHERE id = deals.listing_id AND seller_id = auth.uid()
        )
    );

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_offers_listing ON public.offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_deals_listing ON public.deals(listing_id);
