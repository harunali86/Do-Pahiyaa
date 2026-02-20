# Refactor Plan v2: System-Design Aligned Lead Engine

> **Objective**: Realign current implementation to `SYSTEM_DESIGN.md` so Do Pahiyaa operates as a **lead-driven marketplace SaaS** (not auction-centric demo), with clean architecture, strict security, and monetization via lead unlock + subscriptions.

---

## 1) Hard Rules (Must Enforce)

- **Service-layer only business logic**  
  No DB logic inside UI or route handlers.  
  Route handlers = parse/auth/validate + call services.

- **Lead-first product behavior**  
  Primary CTA is inquiry/contact unlock, not bidding.

- **Schema-first delivery**  
  DB schema + RLS + typed contracts are prerequisites for UI wiring.

- **Security baseline mandatory**  
  Zod validation, middleware role guard, rate limiting, audit logs before release.

---

## 2) Target Architecture Delta

### 2.1 Required code structure
- [ ] Add `src/app/api/` controllers:
  - `src/app/api/listings/*`
  - `src/app/api/leads/*`
  - `src/app/api/webhooks/razorpay/*`
- [ ] Add `src/lib/services/`:
  - `listing.service.ts`
  - `lead.service.ts`
  - `billing.service.ts`
  - `authz.service.ts` (role/permissions helper)
- [ ] Add `src/lib/validations/` for Zod request schemas.
- [ ] Add `src/types/database.types.ts` generated from Supabase schema.

### 2.2 Demo data strategy
- [ ] Keep `src/lib/demo/` temporarily as fallback.
- [ ] Add `USE_MOCK_DATA` flag to switch source.
- [ ] Remove demo dependency only after API-backed pages are stable.

---

## 3) Database & Policy Refactor (Non-Negotiable)

### 3.1 Schema rollout (from SYSTEM_DESIGN)
- [ ] Create/verify enums:
  - `user_role`
  - `listing_status`
  - `lead_status`
- [ ] Create/verify tables:
  - `profiles`
  - `dealers`
  - `listings`
  - `leads`
  - `unlock_events`
  - `subscriptions`
- [ ] Create indexes from design doc for listing/search performance.

### 3.2 RLS rollout
- [ ] Profiles public-read + self-update.
- [ ] Listings public-read only when published + owner manage.
- [ ] Leads restricted:
  - admin read
  - dealer read only if unlocked via `unlock_events`.
- [ ] Test RLS with anon, user, dealer, admin tokens.

### 3.3 Types & migrations
- [ ] All schema changes through Supabase migrations only.
- [ ] Generate `database.types.ts` after each migration change.

---

## 4) API & Service Contracts

### 4.1 ListingService
- [ ] `createListing(userId, input)`
- [ ] `updateListing(userId, listingId, input)`
- [ ] `searchListings(filters, pagination)`
- [ ] `publishListing(userId, listingId)`

### 4.2 LeadService
- [ ] `createLead(buyerId, listingId, message)`
- [ ] `unlockLead(dealerId, leadId)` transactional:
  - verify dealer role
  - verify subscription/credits
  - prevent duplicate unlock
  - deduct credits
  - insert unlock event
  - return masked/unmasked contact payload as per policy

### 4.3 BillingService
- [ ] `syncSubscription(razorpayWebhookPayload)`
- [ ] `checkDealerEntitlement(dealerId)`

### 4.4 API endpoints (minimum)
- [ ] `POST /api/leads`
- [ ] `POST /api/leads/unlock`
- [ ] `GET /api/listings`
- [ ] `POST /api/listings`
- [ ] `PATCH /api/listings/:id`
- [ ] `POST /api/webhooks/razorpay`

---

## 5) UI Refactor to Lead-First

### 5.1 Home (`src/app/page.tsx`)
- [ ] Remove auction-first messaging/CTA priority.
- [ ] Add lead-first sections:
  - verified listings feed
  - “Sell to verified dealers” funnel
  - KPI: leads generated, unlocks, conversion

### 5.2 Listing Details (`src/app/listings/[id]/page.tsx`)
- [ ] Primary CTA split by role:
  - buyer/seller: `Send Inquiry`
  - dealer: `Unlock Contact`
- [ ] Modal states:
  - inquiry submitted
  - unlock success
  - insufficient credits

### 5.3 Dealer Dashboard (`src/app/dealer/dashboard/page.tsx`)
- [ ] Lead inbox focus:
  - new leads
  - unlocked leads
  - conversion funnel
  - credit balance + burn rate
- [ ] Remove bid/auction-centric artifacts from primary dashboard path.

---

## 6) Security & Compliance Tasks

- [ ] Add middleware role guard:
  - `/admin/*` => admin only
  - `/dealer/*` => dealer/admin
- [ ] Add strict Zod validators for every POST/PATCH API.
- [ ] Add rate limiting on auth + lead creation + unlock endpoints.
- [ ] Add audit log events for:
  - lead unlock
  - listing publish/reject
  - admin actions

---

## 7) Execution Order (Corrected)

1. **Schema + RLS + migrations**  
2. **Generate DB types**  
3. **Implement services** (`listing`, `lead`, `billing`)  
4. **Implement API controllers + validations**  
5. **Wire lead-first UI to APIs**  
6. **Apply security middleware + rate limits + audit logs**  
7. **Deprecate demo data paths**

---

## 8) Done Criteria

- [ ] No business logic in components or route handlers.
- [ ] All lead flows work end-to-end with DB + RLS.
- [ ] Dealer unlock flow enforces entitlement and logs unlock event.
- [ ] All critical API routes have Zod validation + rate limiting.
- [ ] Home/listing/dealer screens reflect lead-first product narrative.
- [ ] Build passes: `check-types`, `lint`, `build`.
