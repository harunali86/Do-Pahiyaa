-- Performance Indexes Migration
-- Fixes: Missing indexes on FK columns, filter columns, and ORDER BY columns
-- Per GEMINI.md Rule 3.1: "Index Foreign Keys & Filter Columns"

-- LEADS: Most queried table (admin, dealer, seller all query this)
CREATE INDEX IF NOT EXISTS idx_leads_listing_id ON public.leads(listing_id);
CREATE INDEX IF NOT EXISTS idx_leads_buyer_id ON public.leads(buyer_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- UNLOCK_EVENTS: Queried on every lead view
CREATE INDEX IF NOT EXISTS idx_unlock_events_lead_id ON public.unlock_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_unlock_events_dealer_id ON public.unlock_events(dealer_id);

-- SUBSCRIPTIONS: Queried by dealer dashboard
CREATE INDEX IF NOT EXISTS idx_subscriptions_dealer_id ON public.subscriptions(dealer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- NOTIFICATIONS: Queried on every page load (Navbar bell)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id) WHERE is_read = false;

-- PROFILES: Role-based queries (admin checks)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- LISTINGS: Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_listings_city ON public.listings(city) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON public.listings(created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_listings_company ON public.listings(is_company_listing) WHERE is_company_listing = true;
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings(price) WHERE status = 'published';

-- COMPOSITE: Common query patterns
CREATE INDEX IF NOT EXISTS idx_leads_listing_buyer ON public.leads(listing_id, buyer_id);
