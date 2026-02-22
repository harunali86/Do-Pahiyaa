-- Buyer Unlock Tracking (₹49 Monetization Engine)
CREATE TABLE IF NOT EXISTS public.buyer_unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    payment_id TEXT NOT NULL, -- Razorpay Payment ID
    amount_paid NUMERIC(10, 2) DEFAULT 49.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(buyer_id, listing_id)
);

-- RLS for Buyer Unlocks
ALTER TABLE public.buyer_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view their own unlocks" 
ON public.buyer_unlocks FOR SELECT 
USING (auth.uid() = buyer_id);

-- ADMIN RLS
CREATE POLICY "Admins can view all buyer unlocks"
ON public.buyer_unlocks FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')));
