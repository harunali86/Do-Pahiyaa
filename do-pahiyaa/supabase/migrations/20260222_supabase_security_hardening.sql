-- Supabase Security Hardening (Post-Audit Fixes)
-- Resolves: 4 Mutable Search Path Warnings, 1 RLS Disabled Error, 1 Overly Permissive Policy Warning

-- 1) Enable RSL on legacy/stray tables
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 2) Harden lead_allocation_failures policy
-- Previous policy "Service Insert Allocation Failures" was WITH CHECK (true)
DROP POLICY IF EXISTS "Service Insert Allocation Failures" ON public.lead_allocation_failures;
CREATE POLICY "Service Insert Allocation Failures"
ON public.lead_allocation_failures
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- 3) Harden Security-Critical Functions (SET search_path = public)

-- a) Auth promotion branding
ALTER FUNCTION public.auto_promote_admin() SET search_path = public;

-- b) RBAC Helpers
ALTER FUNCTION public.is_admin_or_superadmin(UUID) SET search_path = public;

-- c) Pricing & Purchase (Legacy & v2)
ALTER FUNCTION public.calculate_subscription_price_v2(JSONB, INTEGER) SET search_path = public;
ALTER FUNCTION public.purchase_subscription_v2(UUID, JSONB, INTEGER, INTEGER) SET search_path = public;
ALTER FUNCTION public.subscription_matches_lead_v2(JSONB, JSONB, TIMESTAMPTZ) SET search_path = public;
ALTER FUNCTION public.allocate_new_lead_v2(UUID, JSONB, TIMESTAMPTZ) SET search_path = public;
ALTER FUNCTION public.purchase_subscription(UUID, JSONB, INTEGER, INTEGER) SET search_path = public;

-- d) Financial / Payment Flows
ALTER FUNCTION public.process_razorpay_credit_purchase(UUID, NUMERIC, INT, NUMERIC, TEXT, TEXT) SET search_path = public;
ALTER FUNCTION public.handle_credit_purchase(UUID, TEXT, TEXT, INTEGER) SET search_path = public;

-- e) System Controls / Rate Limiting
ALTER FUNCTION public.check_rate_limit(TEXT, TEXT, INTEGER, INTEGER) SET search_path = public;
ALTER FUNCTION public.auto_allocate_lead_on_insert() SET search_path = public;

-- f) Admin / Analytics
ALTER FUNCTION public.admin_revenue_by_month() SET search_path = public;
ALTER FUNCTION public.increment_listing_view(UUID) SET search_path = public;
ALTER FUNCTION public.check_dealer_verification() SET search_path = public;
ALTER FUNCTION public.sync_auction_increment_columns() SET search_path = public;

-- g) Allocation Primitives
ALTER FUNCTION public.allocate_lead_to_sub(UUID, UUID, UUID) SET search_path = public;

-- 4) Add restrictive policy for legacy subscriptions just in case
DROP POLICY IF EXISTS "Admin View Subscriptions" ON public.subscriptions;
CREATE POLICY "Admin View Subscriptions" ON public.subscriptions
FOR SELECT USING (public.is_admin_or_superadmin(auth.uid()));
