-- Migration: Implement Financial Audit Trails & Usage Counters
-- Requirement: Global Rules §4.5 (Transactional Integrity) & PRD (Financial Ledgers)

-- 1. Credits Ledger
CREATE TABLE IF NOT EXISTS public.credits_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dealer_id UUID NOT NULL REFERENCES public.dealers(profile_id) ON DELETE CASCADE,
    amount INT NOT NULL, -- positive for credits added, negative for deducted
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('deposit', 'lead_unlock', 'admin_adjustment', 'refund', 'subscription_purchase')),
    reference_id UUID, -- Optional: Links to the specific entity (e.g., lead_id, subscription_id)
    running_balance INT NOT NULL, -- Historical balance at the time of transaction
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_credits_ledger_dealer ON public.credits_ledger(dealer_id);
CREATE INDEX idx_credits_ledger_created_at ON public.credits_ledger(created_at);

-- 2. Billing Adjustments (Admin Only)
CREATE TABLE IF NOT EXISTS public.billing_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dealer_id UUID NOT NULL REFERENCES public.dealers(profile_id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    amount INT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_billing_adjustments_dealer ON public.billing_adjustments(dealer_id);

-- 3. Monthly Usage Counters (For Entitlements)
CREATE TABLE IF NOT EXISTS public.usage_counters_monthly (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dealer_id UUID NOT NULL REFERENCES public.dealers(profile_id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    leads_viewed INT DEFAULT 0 NOT NULL,
    listings_created INT DEFAULT 0 NOT NULL,
    auctions_participated INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(dealer_id, month)
);

-- RLS POLICIES

-- Credits Ledger RLS
ALTER TABLE public.credits_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dealers can view their own ledger" 
ON public.credits_ledger FOR SELECT 
TO authenticated 
USING (
  dealer_id IN (
    SELECT id FROM public.dealers WHERE profile_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all ledgers" 
ON public.credits_ledger FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Note: No INSERT/UPDATE/DELETE policies for clients. Ledgers are written ONLY via secure RPC or Admin Server Actions.

-- Billing Adjustments RLS
ALTER TABLE public.billing_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all adjustments" 
ON public.billing_adjustments FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Usage Counters RLS
ALTER TABLE public.usage_counters_monthly ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dealers can view their own usage" 
ON public.usage_counters_monthly FOR SELECT 
TO authenticated 
USING (
  dealer_id IN (
    SELECT id FROM public.dealers WHERE profile_id = auth.uid()
  )
);

-- Enable realtime for immediate UI sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.credits_ledger;
