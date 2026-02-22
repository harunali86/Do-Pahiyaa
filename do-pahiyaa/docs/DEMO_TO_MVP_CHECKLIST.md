# Do Pahiyaa — Demo to MVP Execution Checklist

This checklist converts the current UI demo into a production-ready MVP with the original project scope.

## 0) Current State (Baseline)

- Frontend screens are available for marketplace, listing detail, search, dealer dashboard, admin panel, and auctions.
- Data is mock/static.
- No real auth, RBAC, DB persistence, payment, or realtime auction settlement yet.

---

## Phase 1 — Core Marketplace + Auth Foundation

## 1.1 Supabase Project and Environment
- [ ] Create Supabase project (prod + staging).
- [ ] Configure env vars in Vercel for both environments.
- [ ] Enable Storage buckets (`listing-images`, `documents`).
- [ ] Enable backup + point-in-time restore policy.

**Acceptance**
- App connects to Supabase in staging and can read/write test tables.

## 1.2 Database Schema (v1)
- [ ] Create tables: `users`, `listings`, `offers`, `deals`, `notifications`, `audit_logs`.
- [ ] Add timestamps, soft-delete fields, status enums.
- [ ] Add indexes for search/filter columns (`city`, `brand`, `year`, `price`, `status`).
- [ ] Add foreign keys with cascade strategy where appropriate.

**Acceptance**
- Migration runs clean on empty DB and rollback works.

## 1.3 Auth + Role Model
- [ ] Wire Supabase Auth (email/OTP or magic link).
- [ ] Implement role mapping: `buyer`, `seller`, `dealer`, `admin`, `super_admin`.
- [ ] Add route guards on frontend.
- [ ] Add RLS policies for role-based table access.

**Acceptance**
- Unauthorized users cannot access restricted routes or records.

## 1.4 Marketplace CRUD
- [ ] Listing creation/edit/delete (seller/dealer).
- [ ] Listing moderation queue (admin approve/reject).
- [ ] Search API with filters (`city`, `price`, `brand`, `year`).
- [ ] Saved listings/watchlist persistence.

**Acceptance**
- End-to-end flow: create listing → admin approval → visible in marketplace.

---

## Phase 2 — Hybrid Negotiation + Payments

## 2.1 Offer/Counter Offer Engine
- [ ] Implement `offers` state machine (`pending`, `countered`, `accepted`, `rejected`, `expired`).
- [ ] Add offer history timeline in listing/deal page.
- [ ] Add expiry logic and audit events.

**Acceptance**
- Buyer and seller can complete counter-offer cycle with full history.

## 2.2 Deal Lifecycle
- [ ] Implement `deals` state machine:
  - `initiated` → `lead_unlocked` → `token_paid` → `inspection` → `completed` / `cancelled`.
- [ ] Add admin override actions with mandatory audit log.
- [ ] Add deal tracking UI for buyer/seller/dealer/admin.

**Acceptance**
- Every deal transition is validated and logged.

## 2.3 Razorpay Integration
- [ ] Setup Razorpay keys per environment.
- [ ] Implement lead unlock fee payment.
- [ ] Implement booking token payment.
- [ ] Implement dealer subscription billing.
- [ ] Add webhook verification + idempotency keys.

**Acceptance**
- Payment success/failure/refund events reconcile correctly in DB.

## 2.4 Revenue Tracking
- [ ] Commission rules table + config.
- [ ] Compute platform fee on completed deals.
- [ ] Add settlement status and reports.

**Acceptance**
- Revenue dashboard values match transaction logs.

---

## Phase 3 — Auction MVP

## 3.1 Auction Data Model
- [ ] Create tables: `auctions`, `bids`, `auction_events`, `auction_settlements`.
- [ ] Add reserve price, min increment, status, anti-sniping config.
- [ ] Add optimistic lock/version column for bid integrity.

**Acceptance**
- Auction can be created, started, and closed through DB-backed workflow.

## 3.2 Live Bidding (Realtime)
- [ ] Use Supabase Realtime channels for bid stream.
- [ ] Server-side bid validation:
  - auction is live
  - bidder eligible
  - amount >= current + increment
  - reserve logic
- [ ] Implement anti-sniping auto-extend window.

**Acceptance**
- Concurrent bids resolve deterministically with no duplicate winner.

## 3.3 Winner Settlement
- [ ] Lock final winning bid at close.
- [ ] Generate settlement record and payment instruction.
- [ ] Trigger notifications to winner/seller/admin.

**Acceptance**
- Closed auction has immutable winner + settlement trail.

---

## Phase 4 — Admin Control + Ops

## 4.1 Admin Full Controls
- [ ] User approval/block + role updates.
- [ ] Listing moderation CRUD.
- [ ] Deal monitor + intervention actions.
- [ ] Auction start/pause/cancel controls.
- [ ] Pricing config + feature toggles + maintenance mode.

**Acceptance**
- All admin actions are permission-protected and audited.

## 4.2 Notifications
- [ ] In-app notification table + read/unread states.
- [ ] Event-driven triggers (offer, deal, payment, auction).
- [ ] Admin broadcast announcement tool.

**Acceptance**
- Key events reliably reach intended roles.

## 4.3 Auditability and Logs
- [ ] Write audit entry for sensitive actions.
- [ ] Centralized app logging with correlation IDs.
- [ ] Error tracking integration (e.g., Sentry).

**Acceptance**
- Any critical action can be traced actor → action → timestamp.

---

## Phase 5 — Security, Performance, Scale Readiness

## 5.1 Security Hardening
- [ ] Input validation with shared schemas (Zod).
- [ ] API rate limiting (auth, bidding, offer endpoints).
- [ ] CSRF/session security checks.
- [ ] Fraud controls for suspicious bidding/payment patterns.

**Acceptance**
- Basic abuse vectors blocked and tested.

## 5.2 Performance
- [ ] Add caching for listing/search APIs.
- [ ] Optimize images and critical rendering path.
- [ ] Add pagination/infinite loading.

**Acceptance**
- p95 response and Core Web Vitals meet MVP target.

## 5.3 Scale Strategy
- [ ] 10 users: single-region defaults and simple monitoring.
- [ ] 1k users: index tuning, cache layer, connection pool tuning.
- [ ] 100k users: read replicas, async workers/queues, CDN strategy, partitioning plan.

**Acceptance**
- Load-test report with bottlenecks and mitigation plan.

---

## Engineering Standards Checklist

- [ ] PR template with test evidence.
- [ ] Migrations reviewed before apply.
- [ ] All critical flows have happy + failure test cases.
- [ ] Feature flags for risky rollouts.
- [ ] Staging signoff before production deploy.

---

## Suggested Execution Order (Practical)

1. Auth + roles + RLS  
2. Listing CRUD + moderation  
3. Offer/deal lifecycle  
4. Razorpay lead unlock + subscriptions  
5. Auction core + realtime bids  
6. Admin controls + audit logs  
7. Security hardening + performance pass  

---

## Definition of MVP Done

- Real user onboarding with role-based access.
- Real listings, offers, deals, and payments end-to-end.
- Live auctions with validated bids and winner settlement.
- Admin panel operationally usable with audit trails.
- Monitoring, alerts, and rollback-ready deployment in place.
