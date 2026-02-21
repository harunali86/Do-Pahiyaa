# Refactor Plan v3: Lead Subscription & Auto-Allocation (Production Hardening)

> Project: **Do Pahiyaa**  
> Scope: **Existing codebase only** (no rebuild)  
> Status: **Implementation-ready**  
> Date: **2026-02-20**

---

## 1) Objective

Deliver a production-grade **Dealer Filter Purchase + Real-time Auto-Allocation** workflow where:
- Dealers pre-purchase lead quota with filters.
- New leads are auto-assigned to matching active subscriptions.
- Quota decrements atomically.
- Pricing is fully admin-configurable (no hardcoded logic).
- Existing lead/unlock flows remain backward-compatible.

---

## 2) Product Decisions (Locked)

1. **Allocation Mode**  
   Default: `broadcast` (all matching dealers get lead allocation).

2. **Fairness Guardrail**  
   Add config `max_dealers_per_lead` to cap fan-out in high-volume markets.

3. **Matching Rule**  
   Filters supported: `city`, `region`, `brand`, `model`, `lead_type`, `date_range`.

4. **Cost Model**  
   Filtered and unfiltered pricing both supported through DB config + pricing rules.

## 2.1 Role Governance (Phase Strategy)

1. **Current phase (implementation now)**  
   Roles active: `buyer`, `seller`, `dealer`, `admin`.

2. **Temporary admin policy**  
   `admin` carries both operational and governance scope for now (effective admin + super-admin control).

3. **Future split (post-auth hardening phase)**  
   Introduce `super_admin` as separate role and restrict `admin` to daily operations only.

4. **Forward compatibility rule**  
   Keep permission checks and audit structures split-ready (no schema/route assumptions that block future role separation).

---

## 3) In-Scope vs Out-of-Scope

**In scope**
- Pricing engine hardening.
- Dealer subscription purchase hardening.
- Auto-allocation hardening.
- Admin pricing/subscription operations UI.
- Dealer subscription visibility improvements.
- Auditability + testability.

**Out of scope**
- Auth redesign.
- Payment gateway redesign.
- Non-lead marketplace redesign.

---

## 4) Database & Migration Plan

## 4.1 Schema updates

### A) `dealer_subscriptions`
- Ensure fields exist:
  - `filters jsonb`
  - `is_unfiltered boolean`
  - `total_quota int`
  - `remaining_quota int`
  - `price_paid_credits int`
  - `price_per_lead numeric`
  - `pricing_snapshot jsonb`
  - `status text`
  - `last_allocated_at timestamptz` (**new if missing**)
- Indexes:
  - `(status, remaining_quota)`
  - `(dealer_id, status)`
  - GIN index on `filters`.

### B) `lead_allocations`
- Keep `UNIQUE(lead_id, dealer_id)` (idempotency).
- Add:
  - `allocation_mode text` (broadcast/priority/exclusive)
  - `allocated_at timestamptz default now()`
- Indexes:
  - `(lead_id)`
  - `(dealer_id, allocated_at desc)`
  - `(subscription_id)`.

### C) `lead_pricing_config`
- Ensure global knobs:
  - `base_lead_price`
  - `filtered_surcharge`
  - `filtered_multiplier`
  - `minimum_purchase_quantity`
  - filter toggles (`city`, `region`, `brand`, `model`, `lead_type`, `date_range`)
  - `allocation_mode` (**new**)
  - `max_dealers_per_lead` (**new**).

### D) `pricing_rules`, `pricing_bulk_discounts`, `city_region_map`
- Keep active and admin-manageable.
- Ensure priority indexes for deterministic application.

### E) `purchase_requests` (**new table**)
- Purpose: idempotent purchase handling.
- Columns:
  - `id uuid pk`
  - `dealer_id uuid`
  - `idempotency_key text unique`
  - `request_payload jsonb`
  - `response_payload jsonb`
  - `created_at timestamptz`.

---

## 4.2 RLS & authorization rules

- Dealer can read only own `dealer_subscriptions` and own `lead_allocations`.
- Current phase: Admin can CRUD pricing config, pricing rules, bulk discounts, city-region map.
- Future phase: split this scope into `admin` (ops) and `super_admin` (governance + role control).
- RPC `purchase_subscription_v3` must enforce:
  - caller is authenticated dealer
  - `auth.uid()` maps to the same dealer account (do not trust client-passed dealer ID).

---

## 4.3 Migration order

1. Add hardening migration (`*_lead_subscription_hardening.sql`).
2. Add idempotency migration (`*_purchase_idempotency.sql`).
3. Update pricing/allocation RPCs to `v3`.
4. Backfill `last_allocated_at` where needed.
5. Regenerate typed DB contracts.

---

## 5) Backend Module Changes

## 5.1 `src/lib/services/pricing.service.ts`
- Keep `calculatePrice`.
- Upgrade purchase flow to call `purchase_subscription_v3` with `idempotency_key`.
- Reject stale totals (`expected_total` mismatch).

## 5.2 `src/lib/services/lead.service.ts`
- Use `allocate_new_lead_v3` on lead creation.
- Pass normalized lead attributes (`city`, `region`, `brand`, `model`, `lead_type`, `created_at`).
- Emit notifications for newly auto-unlocked leads.

## 5.3 `src/lib/services/admin.service.ts`
- Add/verify:
  - `getAllSubscriptions()`
  - `getLeadPricingConfig()`
  - `updateLeadPricingConfig(data)`
  - `getPricingRules()`
  - `savePricingRule(rule)`
  - `deletePricingRule(id)`
- Ensure heavy queries use aggregate RPCs / indexed queries only.

---

## 6) RPC/SQL Contract Changes

## 6.1 `calculate_subscription_price_v3(p_filters, p_quantity)`
- Deterministic rule evaluation:
  1) base price
  2) filtered surcharge/multiplier
  3) conditional rules by priority
  4) bulk discount
- Returns full price breakdown for UI.

## 6.2 `purchase_subscription_v3(p_filters, p_quota, p_expected_total, p_idempotency_key)`
- Steps (single transaction):
  1) Validate dealer identity via `auth.uid()`.
  2) Check/record idempotency request.
  3) Compute current price.
  4) Validate expected total.
  5) Lock dealer credit row (`FOR UPDATE`).
  6) Deduct credits.
  7) Insert subscription with snapshot.
  8) Persist response in `purchase_requests`.

## 6.3 `allocate_new_lead_v3(p_lead_id, p_lead_attributes, p_lead_created_at)`
- Read allocation strategy from `lead_pricing_config`.
- Find matching active subscriptions.
- Respect `max_dealers_per_lead`.
- For each selected subscription call atomic allocator.

## 6.4 `allocate_lead_to_sub_v2(...)`
- Keep quota lock (`FOR UPDATE`).
- Insert `unlock_events` with `cost_credits = 0` for pre-paid lead.
- Update `remaining_quota`, `status`, `last_allocated_at`.
- Return boolean success.

---

## 7) Admin Panel UI Plan

## 7.1 New/Updated components
- `src/components/admin/leads/AdminSubscriptionTable.tsx` (**new**)
  - Search by dealer/filter/status.
  - Columns: dealer, filters, quota, remaining, utilization, status, last allocation.

- `src/components/admin/pricing/AdminPricingManager.tsx` (**new**)
  - Global config editor.
  - Filter enable/disable toggles.
  - Bulk discount tier management.
  - Custom pricing rule CRUD.

## 7.2 New pages
- `src/app/admin/leads/subscriptions/page.tsx` (**new**)
- `src/app/admin/leads/pricing/page.tsx` (**new**)  
  (can link/redirect to existing `admin/pricing` route if preferred).

---

## 8) Dealer Panel UI Plan

- Update `ActiveSubscriptions` UI:
  - show `remaining_quota / total_quota`
  - show `last_allocated_at`
  - show `Auto-Allocation Active` badge
  - show filter chips and per-lead effective price snapshot.

---

## 9) Realtime & Notifications

- On new lead creation:
  1) lead insert
  2) allocation RPC
  3) unlock_event + lead_allocation writes
  4) dealer notification insert
  5) realtime payload to dealer lead inbox.

- Add “auto-allocated lead” notification type.

---

## 10) Performance Plan

- Avoid loading full transaction history in admin dashboards.
- Use aggregate RPCs for revenue/subscription metrics.
- Add pagination + server-side filtering in admin subscriptions page.
- Add query indexes listed in section 4.

---

## 11) Testing Checklist

## 11.1 Automated
- Pricing calculation unit tests:
  - base-only
  - filtered surcharge
  - rule priority
  - bulk discount
  - minimum quantity rejection
- Purchase integration tests:
  - success path
  - stale expected total
  - insufficient credits
  - idempotency retry returns same result
  - unauthorized dealer blocked
- Allocation integration tests:
  - one lead matching multiple subscriptions
  - quota decrement per match
  - duplicate allocation blocked by unique constraint
  - exhausted subscription skipped
  - `max_dealers_per_lead` cap enforced
- Regression:
  - manual unlock flow still works
  - existing dealer lead pages still render.

## 11.2 Manual
1. Dealer buys pack (`City: Pune`, quota 50) and sees balance reduced.
2. New Pune lead enters system.
3. Dealer unlocked lead appears automatically.
4. `dealer_subscriptions.remaining_quota` decrements.
5. Admin sees subscription utilization update.
6. Admin edits pricing and next purchase uses new rate.

---

## 12) Rollout & Rollback

## 12.1 Rollout
1. Deploy migrations.
2. Deploy backend services/RPC callers.
3. Enable admin UI.
4. Enable dealer UI enhancements.
5. Monitor allocation success rate + error rate for 24h.

## 12.2 Rollback
- Keep v2 RPCs available during transition.
- Feature flag to revert purchase/allocation calls to v2.
- Migration rollback scripts for additive columns/tables only where safe.

---

## 13) Definition of Done (DoD)

- End-to-end purchase → auto-allocation works in production-like environment.
- No hardcoded pricing in app layer.
- Dealer cannot purchase for another dealer identity.
- Allocation idempotency and quota integrity verified under concurrency.
- Admin can fully control pricing model without code deploy.
- Audit trail exists for pricing changes and allocations.
- `npm run build` and `npm run check-types` pass.

---

## 14) Open items for final sign-off

1. Confirm default `allocation_mode = broadcast`.
2. Confirm initial `max_dealers_per_lead` value (recommended: `3`).
3. Confirm whether enterprise plans can bypass cap.
4. Confirm target date for `super_admin` role split after auth rollout.
