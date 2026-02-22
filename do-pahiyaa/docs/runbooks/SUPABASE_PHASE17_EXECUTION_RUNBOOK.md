# Supabase Execution Runbook (Phase 17)

Use this runbook to apply Dealer Filter Purchase + Dynamic Pricing changes in your **existing** Supabase project.

---

## 1) Pre-check (What is already applied?)

Run in Supabase SQL Editor:

```sql
select version, name
from supabase_migrations.schema_migrations
order by version;
```

If `supabase_migrations.schema_migrations` is unavailable in your environment, skip and apply migrations carefully in order.

---

## 2) Migration Apply Order (Exact)

Apply these SQL files in this order:

1. `supabase/migrations/20260220_dealer_filter_pricing.sql`
2. `supabase/migrations/20260220_pricing_rpcs.sql`
3. `supabase/migrations/20260220_allocation_rpcs.sql`
4. `supabase/migrations/20260220_dealer_filter_pricing_v2.sql`
5. `supabase/migrations/20260220_admin_dashboard_perf.sql`
6. `supabase/migrations/20260220_auction_schema_compat.sql`
7. `supabase/migrations/20260220_outbid_notifications_patch.sql`
8. `supabase/migrations/20260220_audit_logs_rbac_patch.sql`
9. `supabase/migrations/20260220_rate_limit_distributed.sql`
10. `supabase/migrations/20260220_lead_auto_allocation_trigger.sql`

If some are already applied, apply only missing ones.

---

## 3) Seed / Baseline Config (Ready SQL)

Run this block after migrations:

```sql
-- 3.1 Global pricing config (single-row)
insert into public.lead_pricing_config (
  id,
  base_lead_price,
  filtered_lead_surcharge,
  filtered_lead_multiplier,
  min_purchase_qty,
  filter_city_enabled,
  filter_region_enabled,
  filter_brand_enabled,
  filter_model_enabled,
  filter_lead_type_enabled,
  filter_date_range_enabled
)
values (
  true,
  20,        -- base credits per lead
  5,         -- surcharge when any filter is used
  1.10,      -- 10% multiplier for filtered packs
  10,
  true,
  true,
  true,
  true,
  true,
  true
)
on conflict (id) do update
set
  base_lead_price = excluded.base_lead_price,
  filtered_lead_surcharge = excluded.filtered_lead_surcharge,
  filtered_lead_multiplier = excluded.filtered_lead_multiplier,
  min_purchase_qty = excluded.min_purchase_qty,
  filter_city_enabled = excluded.filter_city_enabled,
  filter_region_enabled = excluded.filter_region_enabled,
  filter_brand_enabled = excluded.filter_brand_enabled,
  filter_model_enabled = excluded.filter_model_enabled,
  filter_lead_type_enabled = excluded.filter_lead_type_enabled,
  filter_date_range_enabled = excluded.filter_date_range_enabled,
  updated_at = now();

-- 3.2 City -> Region map (sample)
insert into public.city_region_map (city, region, is_active)
values
  ('Mumbai', 'West', true),
  ('Pune', 'West', true),
  ('Delhi', 'North', true),
  ('Gurgaon', 'North', true),
  ('Bengaluru', 'South', true),
  ('Chennai', 'South', true),
  ('Hyderabad', 'South', true),
  ('Kolkata', 'East', true)
on conflict (city) do update
set region = excluded.region,
    is_active = excluded.is_active,
    updated_at = now();

-- 3.3 Pricing rules (lead_type/date_range/city)
insert into public.pricing_rules (
  name, description, condition_type, condition_value,
  adjustment_type, adjustment_value, is_active, priority
)
values
  ('Lead Type: Buy Used', 'Used-bike buyer leads premium', 'lead_type', 'buy_used', 'flat_fee', 3, true, 100),
  ('Date Range: Last 7 Days', 'Recent lead premium', 'date_range', 'last_7_days', 'percentage', 5, true, 90),
  ('City: Mumbai', 'Metro city surcharge', 'city', 'Mumbai', 'flat_fee', 10, true, 120),
  ('Filtered Pack Premium', 'Any filtered purchase premium', 'filtered', 'any', 'multiplier', 1.05, true, 80),
  ('Unfiltered Pack Discount', 'Unfiltered volume incentive', 'unfiltered', 'any', 'percentage', -5, true, 70);

-- 3.4 Bulk discounts
insert into public.pricing_bulk_discounts (
  min_quantity, max_quantity, discount_type, discount_value, is_active, priority
)
values
  (25, 49, 'percentage', 5, true, 50),
  (50, 99, 'percentage', 10, true, 60),
  (100, null, 'percentage', 15, true, 70);
```

> Note: If you re-run seed, either delete old test rules first, or convert inserts to upsert strategy with unique business keys.

---

## 4) Smoke Tests (Ready SQL)

### 4.1 Price calculation RPC

```sql
-- Filtered example
select public.calculate_subscription_price_v2(
  '{"city":"Mumbai","brand":"Royal Enfield","lead_type":"buy_used","date_range":"last_7_days"}'::jsonb,
  25
);

-- Unfiltered example
select public.calculate_subscription_price_v2('{}'::jsonb, 25);

-- Min qty guard example (should fail if min is 10)
select public.calculate_subscription_price_v2('{}'::jsonb, 5);
```

### 4.2 Admin dashboard revenue RPC

```sql
select public.admin_total_revenue();
```

---

## 5) Dealer Purchase E2E Check

1. Login as dealer in app.
2. Open `/dealer/leads/purchase`.
3. Try filtered pack and unfiltered pack.
4. Verify:
   - price preview changes by filters + qty,
   - purchase success deducts dealer credits,
   - row inserted in `dealer_subscriptions` with `pricing_snapshot`.

SQL verify:

```sql
select id, dealer_id, filters, is_unfiltered, total_quota, remaining_quota, price_paid_credits, price_per_lead, created_at
from public.dealer_subscriptions
order by created_at desc
limit 20;
```

---

## 6) Lead Allocation E2E Check

1. Create a new buyer inquiry/lead for listing matching subscription filters.
2. Verify:
   - `lead_allocations` row created,
   - subscription `remaining_quota` decremented,
   - unlock events created with pre-paid allocation path.

SQL verify:

```sql
select id, lead_id, dealer_id, subscription_id, allocated_at
from public.lead_allocations
order by allocated_at desc
limit 20;

select id, dealer_id, total_quota, remaining_quota, status
from public.dealer_subscriptions
order by created_at desc
limit 20;
```

---

## 7) If Admin Panel Still Feels Slow

Check:
- Too many rows in `transactions`/`leads` without proper indexes.
- Expensive client-side rendering on admin charts.
- Network waterfall from sequential API calls.

Already patched in code:
- Revenue now uses `admin_total_revenue()` aggregate function.
- Dashboard core calls are parallelized.

---

## 8) Edge Rate Limit Mode (Optional, Recommended for Production)

To enable distributed throttling (instead of in-memory), set:

```env
RATE_LIMIT_MODE=distributed
```

Code path:
- `src/proxy.ts`
- `src/lib/rate-limit.ts`
