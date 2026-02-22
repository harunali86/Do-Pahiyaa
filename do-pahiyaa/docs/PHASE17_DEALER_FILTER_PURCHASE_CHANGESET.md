# Phase 17 Change Set: Dealer Filter Purchase + Dynamic Pricing

## 1) Change Plan (Implemented)
- Extend existing lead-purchase flow; no rebuild/new project.
- Add DB-backed dynamic pricing configuration (no hardcoded rates).
- Add server-authoritative pricing + purchase RPCs.
- Add allocation matcher for incoming leads against active subscriptions.
- Upgrade dealer purchase UI for filtered/unfiltered buying.
- Upgrade admin panel for end-to-end pricing control.

## 2) Database Updates

### New migration
- `supabase/migrations/20260220_dealer_filter_pricing_v2.sql`
- `supabase/migrations/20260220_admin_dashboard_perf.sql` (admin revenue aggregation optimization)

### Added tables
- `lead_pricing_config`
  - Global pricing knobs: base price, filtered surcharge/multiplier, min qty.
  - Filter enable/disable toggles: city/region/brand/model/lead_type/date_range.
- `city_region_map`
  - City → region mapping for pricing and allocation matching.
- `pricing_bulk_discounts`
  - Tiered discount logic by quantity and priority.

### Extended tables
- `dealer_subscriptions`
  - Added `is_unfiltered`, `price_per_lead`, `pricing_snapshot`.

### Added/updated functions
- `is_admin_or_superadmin(...)`
- `calculate_subscription_price_v2(p_filters, p_quantity)`
- `purchase_subscription_v2(p_dealer_id, p_filters, p_quota, p_expected_total)`
- `subscription_matches_lead_v2(p_filters, p_lead_attributes, p_lead_created_at)`
- `allocate_new_lead_v2(p_lead_id, p_lead_attributes, p_lead_created_at)`

### RLS/policy hardening
- Admin/super_admin manage access for:
  - `pricing_rules`
  - `lead_pricing_config`
  - `city_region_map`
  - `pricing_bulk_discounts`
  - `dealer_subscriptions`
  - `lead_allocations`

## 3) Modules Impacted

### Backend/services
- `src/lib/services/pricing.service.ts`
  - Replaced with RPC-driven pricing/purchase flow.
- `src/lib/services/lead.service.ts`
  - Allocation flow now uses `allocate_new_lead_v2`.
  - Adds region resolution from `city_region_map`.
- `src/app/actions/pricing.ts`
  - Actions now call new service interfaces for calc/purchase.

### Dealer UI
- `src/app/dealer/leads/purchase/page.tsx`
  - Loads city/brand/model/region/lead_type/date_range options.
  - Parallelized data fetches for better response time.
- `src/components/dealer/PurchaseLeadsClient.tsx`
  - Supports filtered/unfiltered toggle.
  - Dynamic price preview + min qty guard + purchase confirmation.

### Admin UI
- `src/app/admin/pricing/page.tsx`
  - Loads pricing rules, global config, and bulk discounts.
- `src/components/admin/pricing/PricingRulesClient.tsx`
  - Global pricing config editor.
  - Filter enable/disable controls.
  - Pricing rule management (city/region/brand/model/lead_type/date_range/filtered/unfiltered).
  - Bulk discount tier management.
- `src/components/admin/Sidebar.tsx`
  - Added Pricing Engine navigation.
- `src/components/admin/CommandMenu.tsx`
  - Added Pricing Engine command.
- `src/app/admin/page.tsx`
  - Parallelized admin dashboard data fetch.
- `src/lib/services/admin.service.ts`
  - Revenue now fetched via SQL aggregate RPC (`admin_total_revenue`) instead of loading all transaction rows.
  - Removed unused unlock feed query from live activity pipeline.

## 4) Migration Notes (for Gemini/Supabase push)

Run migration in Supabase SQL (or CLI) in this order:
1. Existing Phase 17 base migration(s):
   - `20260220_dealer_filter_pricing.sql`
   - `20260220_pricing_rpcs.sql`
   - `20260220_allocation_rpcs.sql`
2. Then apply hardening:
   - `20260220_dealer_filter_pricing_v2.sql`
3. Apply performance function:
   - `20260220_admin_dashboard_perf.sql`

If your Supabase project already has prior migrations applied, only apply missing files.

Post-migration seed recommendations:
- Insert/update one row in `lead_pricing_config` (`id=true`).
- Add city-region rows for major cities.
- Add at least one active `lead_type` rule and `date_range` rule for richer UI options.
- Add one bulk discount tier to validate discount path.

## 5) Backward Compatibility Notes
- Existing lead/inquiry flows remain intact.
- Existing `purchase_subscription` RPC remains untouched; v2 is additive.
- Dealer can still buy unfiltered leads (empty filter payload).

## 6) Testing Checklist

### Pricing engine
- [ ] Admin updates base price/surcharge/multiplier/min qty and saves.
- [ ] Disabled filters block pricing request with proper error.
- [ ] Rule combinations apply in expected priority order.
- [ ] Bulk discount applies for matching quantity range.

### Dealer purchase flow
- [ ] Dealer can switch filtered/unfiltered mode.
- [ ] Real-time price preview updates with filter/qty changes.
- [ ] Purchase fails on price mismatch when expected total stale.
- [ ] Purchase succeeds and dealer credits reduce atomically.
- [ ] Subscription row created with `pricing_snapshot`.

### Allocation flow
- [ ] New lead triggers allocation via `allocate_new_lead_v2`.
- [ ] Matching subscriptions get allocation records.
- [ ] Subscription quota decrements correctly and exhausts to status update.
- [ ] Duplicate lead-dealer allocation is prevented.

### Regression checks
- [ ] Existing lead unlock flow still works.
- [ ] Dealer subscription list page still renders.
- [ ] Admin pricing page loads and updates all sections.
