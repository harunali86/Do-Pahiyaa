# Gemini Handoff — Hybrid Bike Marketplace Platform

## 1) Project Path

- Absolute project root: `/home/harun/codex`
- Work inside this directory for all code, docs, and setup.

## 2) Product Vision

Build an industry-grade hybrid bike marketplace platform with:

1. B2C public marketplace (individual buyers/sellers)
2. B2B dealer channel (inventory + lead pipeline)
3. Realtime dealer auction system
4. Hybrid negotiation model (lead unlock + booking token + commission)
5. Admin and super-admin control center

## 3) Current Repository State

Initial Next.js scaffold is already present with base config and starter structure.

### Existing core files

- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/lib/env.ts`
- `src/lib/utils.ts`
- `src/lib/demo/mock-data.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/browser.ts`
- `src/lib/supabase/admin.ts`
- `src/types/domain.ts`

## 4) Required Roles and Permissions

### Buyer

- Browse/search listings
- Save/watch listings
- Place offers and counter flow participation
- Track own deals
- Pay booking token

### Seller

- Create/update/delete own listings
- Accept/reject/counter offers
- Participate in deal state transitions

### Dealer

- All seller capabilities
- Manage dealer inventory
- Unlock leads via payment
- Access lead inbox and analytics
- Join and bid in B2B auctions
- Buy subscription plans

### Admin

- Approve/block users
- Moderate listings
- Monitor deals
- Control auctions (start/pause/cancel)
- Broadcast notifications
- Manage pricing config and feature toggles

### Super Admin

- All admin permissions
- Role grants/revokes
- Maintenance mode
- High-impact system settings

## 5) Mandatory Modules

1. Public marketplace
2. Dealer dashboard
3. Realtime auction room
4. Hybrid negotiation/deal engine
5. Admin panel
6. Payments (Razorpay)
7. Notifications
8. Analytics

## 6) Functional Requirements

### Marketplace

- Listing creation with images/specs/condition
- Search and filters: city, price, brand, year
- Offer/counter-offer workflow
- Saved listings + watchlist
- Lead generation and deal tracking

### Hybrid Model

- Lead unlock payment
- Contact reveal only after successful unlock
- Booking token payment flow
- Commission calculation and tracking
- Enforced deal lifecycle states

### Dealer Channel

- Inventory management
- Lead inbox with statuses
- Analytics (conversion, spend, closure)
- Subscription plan billing and renewals

### Auction System

- Realtime bids
- Countdown timer
- Min increment rules
- Reserve price
- Anti-sniping auto extension
- Bid history + winner settlement
- Auction audit logs

### Admin Panel

- Full CRUD across users, listings, deals, auctions
- Revenue dashboard (fees, subscriptions, commission)
- Push/broadcast announcements
- Settings: pricing, feature flags, maintenance mode
- System-wide audit log viewer

## 7) Non-Functional Requirements

- Secure auth + strict RBAC + RLS
- High availability and low latency
- Fraud prevention and anti-manipulation controls
- Strong observability (logs, metrics, error tracking)
- Full auditability for critical actions
- Scalable DB design for 10 -> 1k -> 100k users

## 8) Proposed Technical Stack

- Frontend: `Next.js` + `Tailwind CSS`
- Backend/data: `Supabase` (`Postgres`, `Auth`, `Realtime`, `Storage`)
- Hosting: `Vercel`
- Edge/WAF/CDN: `Cloudflare`
- Payments: `Razorpay`

## 9) Data Model to Implement

Must implement (with strong FK relationships, indexes, RLS):

- `users`
- `listings`
- `offers`
- `deals`
- `subscriptions`
- `payments`
- `auctions`
- `bids`
- `notifications`
- `audit_logs`

Recommended supporting tables:

- `listing_images`
- `saved_listings`
- `watchlist`
- `deal_events`
- `subscription_plans`
- `feature_flags`
- `system_settings`

## 10) API Surface to Implement

### Marketplace APIs

- `GET /api/listings`
- `POST /api/listings`
- `GET /api/listings/:id`
- `PATCH /api/listings/:id`
- `DELETE /api/listings/:id`

### Offers + Deals

- `POST /api/listings/:id/offers`
- `POST /api/offers/:id/counter`
- `POST /api/offers/:id/accept`
- `POST /api/offers/:id/reject`
- `POST /api/deals/:id/transition`
- `GET /api/me/deals`

### Hybrid Payments

- `POST /api/deals/:id/unlock-lead/order`
- `POST /api/deals/:id/booking-token/order`
- `POST /api/payments/razorpay/webhook`

### Dealer

- `GET /api/dealer/inventory`
- `GET /api/dealer/leads`
- `GET /api/dealer/analytics`
- `POST /api/dealer/subscriptions/order`

### Auctions

- `GET /api/auctions`
- `POST /api/auctions`
- `GET /api/auctions/:id`
- `POST /api/auctions/:id/bids`
- `GET /api/auctions/:id/bids`
- `POST /api/auctions/:id/start`
- `POST /api/auctions/:id/pause`
- `POST /api/auctions/:id/cancel`
- `POST /api/auctions/:id/settle`

### Admin

- `GET/PATCH /api/admin/users/:id`
- `GET/PATCH /api/admin/listings/:id`
- `GET /api/admin/deals`
- `GET /api/admin/auctions`
- `GET /api/admin/revenue`
- `POST /api/admin/notifications/broadcast`
- `GET/PATCH /api/admin/settings`
- `GET /api/admin/audit-logs`

## 11) Realtime Design Requirements

- Use `Supabase Realtime` channels for:
  - Auction room bid updates
  - Auction countdown extensions (anti-sniping)
  - In-app user notifications
- Bidding must be server-authoritative via transactional RPC.
- Clients must support reconnect + bid sequence catch-up.

## 12) Security Requirements

- Input validation with strict schemas
- Route-level RBAC + DB-level RLS
- Payment webhook signature verification
- Idempotency for payment and settlement flows
- Rate limits per route and per actor
- Bid tamper prevention and concurrency-safe writes
- Audit logs for all sensitive operations

## 13) Scalability Milestones

### ~10 Users

- Single-region app with basic monitoring

### ~1,000 Users

- Query optimization + indexes + cache strategy
- Queue/outbox for notification and async work

### ~100,000 Users

- Table partitioning (bids, notifications, audit logs)
- Read replicas/search optimization
- Aggressive edge caching and WAF policies
- Operational SLOs and incident response playbooks

## 14) Frontend Demo Scope (Current Priority)

Build polished, responsive UI first using mock data:

- Public marketplace page
- Listing detail page
- Dealer dashboard page
- Auction listing page
- Live auction room page
- Admin dashboard page

Use `src/lib/demo/mock-data.ts` for immediate UI rendering.

## 15) Implementation Phases

1. Phase 1: Core marketplace
2. Phase 2: Hybrid lead/token flows
3. Phase 3: Realtime auctions
4. Phase 4: Scaling, hardening, observability

## 16) Environment Variables

Required runtime env keys:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `APP_BASE_URL`

## 17) Gemini Execution Instructions

1. Continue from `/home/harun/codex`.
2. Prioritize frontend demo pages and component system first.
3. Keep architecture compatible with Supabase-backed production rollout.
4. After frontend demo, implement DB migrations and API modules incrementally.
5. Preserve strict typing, modular structure, and security-first conventions.

