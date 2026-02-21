-- Platform Config: Admin-controllable key-value store for pricing and feature settings
-- Per GEMINI.md: Nothing hardcoded. All prices configurable.

CREATE TABLE IF NOT EXISTS public.platform_config (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    label TEXT NOT NULL,           -- Human-readable label for admin UI
    category TEXT NOT NULL DEFAULT 'general',  -- Group configs in admin UI
    description TEXT,              -- Tooltip/help text
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id)
);

-- Seed default pricing values
INSERT INTO public.platform_config (key, value, label, category, description) VALUES
    ('lead_unlock_price', '1', 'Lead Unlock Price (Credits)', 'pricing', 'Number of credits a dealer pays to unlock a lead''s contact info'),
    ('free_listing_quota', '3', 'Free Listing Quota', 'pricing', 'Number of free listings allowed per individual seller'),
    ('featured_ad_price', '499', 'Featured Ad Price (₹)', 'pricing', 'Price in INR to feature a listing at the top of search'),
    ('dealer_listing_price', '199', 'Dealer Listing Price (₹)', 'pricing', 'Price in INR per listing for dealers beyond quota'),
    ('credit_pack_10_price', '4999', 'Credit Pack (10) Price (₹)', 'pricing', 'Price for 10 lead-unlock credits'),
    ('credit_pack_25_price', '9999', 'Credit Pack (25) Price (₹)', 'pricing', 'Price for 25 lead-unlock credits'),
    ('credit_pack_50_price', '17999', 'Credit Pack (50) Price (₹)', 'pricing', 'Price for 50 lead-unlock credits'),
    ('maintenance_mode', 'false', 'Maintenance Mode', 'system', 'Disable access for all non-admin users'),
    ('auctions_enabled', 'true', 'Enable Auctions', 'features', 'Toggle auction functionality'),
    ('new_signups_enabled', 'true', 'Allow New Signups', 'features', 'Toggle registration for new users')
ON CONFLICT (key) DO NOTHING;

-- RLS: Public read for non-sensitive, Admin-only write
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read config" ON public.platform_config
    FOR SELECT USING (true);

CREATE POLICY "Admin only writes config" ON public.platform_config
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Index
CREATE INDEX IF NOT EXISTS idx_platform_config_category ON public.platform_config(category);
