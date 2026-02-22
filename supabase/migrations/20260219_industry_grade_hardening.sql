-- Phase 11: Industry-Grade Hardening Schema

-- 1. Auctions Table
CREATE TABLE IF NOT EXISTS public.auctions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES public.listings(id) NOT NULL,
    start_price NUMERIC(12, 2) NOT NULL,
    reserve_price NUMERIC(12, 2),
    min_increment NUMERIC(12, 2) DEFAULT 1000,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled', -- scheduled, live, paused, ended, cancelled
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Bids Table
CREATE TABLE IF NOT EXISTS public.bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auction_id UUID REFERENCES public.auctions(id) NOT NULL,
    bidder_id UUID REFERENCES public.profiles(id) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Favorites (Saved Bikes)
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    listing_id UUID REFERENCES public.listings(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, listing_id)
);

-- 4. KYC Documents
CREATE TABLE IF NOT EXISTS public.kyc_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    document_type TEXT NOT NULL, -- aadhar, pan, gst, license
    id_number TEXT,
    file_url TEXT,
    status TEXT DEFAULT 'pending', -- pending, verified, rejected
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Reviews System
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES public.listings(id),
    reviewer_id UUID REFERENCES public.profiles(id) NOT NULL,
    reviewee_id UUID REFERENCES public.profiles(id) NOT NULL, -- The Seller/Dealer
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS POLICIES

-- Auctions: Viewable by everyone, editable by admin
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auctions are viewable by everyone" ON public.auctions FOR SELECT USING (true);

-- Bids: Viewable by everyone (for real-time), creatable by authenticated users
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bids are viewable by everyone" ON public.bids FOR SELECT USING (true);
CREATE POLICY "Authenticated users can place bids" ON public.bids FOR INSERT WITH CHECK (auth.uid() = bidder_id);

-- Favorites: Owner only
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own favorites" ON public.favorites 
    FOR ALL USING (auth.uid() = user_id);

-- KYC: Owner and Admin only
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view/upload own KYC" ON public.kyc_documents 
    FOR ALL USING (auth.uid() = user_id);

-- Reviews: Viewable by everyone, creatable by buyer
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can leave reviews" ON public.reviews 
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_bids_auction ON public.bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_user ON public.kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.reviews(reviewee_id);
