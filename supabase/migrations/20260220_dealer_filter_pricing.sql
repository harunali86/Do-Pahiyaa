-- Phase 17: Dealer Filter Purchase & Dynamic Pricing Schema

-- 1. Pricing Rules Table (The core dynamic engine)
CREATE TABLE IF NOT EXISTS public.pricing_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL, -- e.g., "Mumbai Surcharge", "Royal Enfield Premium"
    description TEXT,
    condition_type TEXT NOT NULL, -- strict: 'city', 'brand', 'model', 'lead_type', 'date_range'
    condition_value TEXT NOT NULL, -- e.g., 'Mumbai', 'Royal Enfield', 'SUV'
    adjustment_type TEXT NOT NULL, -- 'flat_fee', 'multiplier', 'percentage'
    adjustment_value NUMERIC(10, 2) NOT NULL, -- e.g., 10 (credits), 1.5 (multiplier)
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- Higher priority rules apply first? Or we sum all? Typically sum.
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Dealer Subscriptions (Active Filter Packs)
CREATE TABLE IF NOT EXISTS public.dealer_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dealer_id UUID REFERENCES public.dealers(profile_id) NOT NULL,
    filters JSONB NOT NULL, -- e.g., { "city": "Mumbai", "brand": "Royal Enfield" }
    total_quota INTEGER NOT NULL, -- How many leads purchased
    remaining_quota INTEGER NOT NULL, -- Decrements as leads are assigned
    price_paid_credits INTEGER NOT NULL, -- Snapshotted cost at time of purchase
    status TEXT DEFAULT 'active', -- active, exhausted, expired
    expires_at TIMESTAMPTZ, -- Optional expiration
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Lead Allocations (Audit trail of assignment)
CREATE TABLE IF NOT EXISTS public.lead_allocations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES public.leads(id) NOT NULL,
    subscription_id UUID REFERENCES public.dealer_subscriptions(id) NOT NULL,
    dealer_id UUID REFERENCES public.dealers(profile_id) NOT NULL,
    allocated_at TIMESTAMPTZ DEFAULT now(),
    -- Constraint: One lead allocated to a dealer only once? Or can multiple dealers get it? 
    -- Requirement says "Leads assigned in real time". Typically marketplace leads go to multiple if they buy unfiltered, 
    -- but filtered packs usually guarantee exclusivity OR priority. 
    -- For now, we allow multiple but unique per dealer-lead pair.
    UNIQUE(lead_id, dealer_id)
);

-- 4. RLS POLICIES

-- Pricing Rules: Admin Manage, Everyone Read (for calculation)
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Pricing Rules" ON public.pricing_rules FOR SELECT USING (true);
CREATE POLICY "Admin Manage Pricing Rules" ON public.pricing_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Dealer Subscriptions: Dealer View Own, Admin Manage
ALTER TABLE public.dealer_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dealer View Own Subscriptions" ON public.dealer_subscriptions 
    FOR SELECT USING (dealer_id = auth.uid());
CREATE POLICY "Admin Manage Subscriptions" ON public.dealer_subscriptions 
    FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Lead Allocations: Dealer View Own, Admin Manage
ALTER TABLE public.lead_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dealer View Own Allocations" ON public.lead_allocations 
    FOR SELECT USING (dealer_id = auth.uid());
CREATE POLICY "Admin Manage Allocations" ON public.lead_allocations 
    FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. INDEXES for Performance
CREATE INDEX idx_pricing_rules_active ON public.pricing_rules(is_active);
CREATE INDEX idx_dealer_subs_dealer ON public.dealer_subscriptions(dealer_id);
CREATE INDEX idx_dealer_subs_status ON public.dealer_subscriptions(status) WHERE status = 'active';
CREATE INDEX idx_allocations_lead ON public.lead_allocations(lead_id);
