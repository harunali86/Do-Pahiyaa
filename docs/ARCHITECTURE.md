# System Architecture - Hybrid Bike Marketplace Platform

## 1. System Architecture

The platform follows a **Serverless, Event-Driven Architecture** optimized for scalability and realtime interactions.

- **Frontend**: Next.js 14+ (App Router) with React Server Components (RSC) for SEO and performance.
- **Styling**: Tailwind CSS for rapid, utility-first UI development.
- **Backend**: Supabase (Backend-as-a-Service).
  - **Database**: PostgreSQL with Row Level Security (RLS).
  - **Auth**: Supabase Auth (JWT-based).
  - **Storage**: Supabase Storage for listing images.
  - **Realtime**: Supabase Realtime (WebSockets) for auctions and notifications.
- **Edge Layer**: Cloudflare (caching, WAF, DNS).
- **Hosting**: Vercel (Edge Functions, static serving).
- **Payments**: Razorpay (Lead unlock, Subscription).

## 2. Database Schema

The database uses a relational model with strong foreign key constraints.

### Core Tables
- **`users`**: `id` (PK), `email`, `role` (enum), `full_name`, `phone`, `status`.
- **`listings`**: `id` (PK), `seller_id` (FK), `title`, `price`, `specs` (JSONB), `status`, `location`.
- **`listing_images`**: `id`, `listing_id` (FK), `url`, `order`.
- **`offers`**: `id`, `listing_id` (FK), `buyer_id` (FK), `amount`, `status` (pending/accepted/rejected).
- **`deals`**: `id`, `listing_id` (FK), `seller_id`, `buyer_id`, `status` (lead_unlocked/completed).
- **`auctions`**: `id`, `listing_id` (FK), `start_time`, `end_time`, `start_price`, `reserve_price`, `status`, `current_bid`.
- **`bids`**: `id`, `auction_id` (FK), `bidder_id` (FK), `amount`, `timestamp`.
- **`notifications`**: `id`, `user_id` (FK), `type`, `payload` (JSONB), `read_at`.
- **`audit_logs`**: `id`, `actor_id` (FK), `action`, `resource_id`, `metadata` (JSONB).

## 3. API Design

We use Next.js Route Handlers (`app/api/...`) for specific transactional logic, while leveraging Supabase Client for direct data fetching where RLS provides sufficient security.

### Key Endpoints (REST)
- `POST /api/listings`: Create new listing (with server-side validation).
- `POST /api/offers`: Submit an offer.
- `POST /api/leads/{id}/unlock`: Process Razorpay payment for lead unlock.
- `POST /api/auctions/{id}/bid`: Place a bid (Transactional, heavy validation).
- `GET /api/admin/stats`: Aggregated analytics for admin dashboard.

## 4. Realtime Flow

Realtime features are powered by Supabase Channels.

1.  **Auctions**:
    -   Channel: `auction:{id}`
    -   Events: `bid_placed`, `time_extended`, `auction_ended`.
    -   Flow: User places bid via API -> Server validates & inserts DB -> DB Trigger/Server pushes event to Channel -> All clients update state.
2.  **Notifications**:
    -   Channel: `user:{id}`
    -   Events: `notification_new`.

## 5. Security Plan

-   **Authentication**: Secure HttpOnly cookies / JWT handling via Supabase Auth helpers.
-   **Authorization**:
    -   **RLS**: Database-level policy (e.g., `listings.select` public, `deals.select` owner-only).
    -   **RBAC**: Middleware checks for `admin` routes.
-   **Input Validation**: Zod schemas for all API inputs.
-   **Fraud Prevention**:
    -   Rate limiting on bid endpoints.
    -   Signature verification for Razorpay webhooks.

## 6. Implementation Roadmap

-   **Phase 1: Core Marketplace (Frontend Demo)**
    -   Public browsing, Search, Listing Details.
    -   Dealer Dashboard UI.
    -   Mock Data integration.
-   **Phase 2: Hybrid Flows**
    -   Supabase generic setup.
    -   Deal engine (Offers, Leads).
    -   Payment integration.
-   **Phase 3: Auctions**
    -   Realtime bidding engine.
    -   Auction lifecycle management.
-   **Phase 4: Scaling**
    -   Performance tuning, Caching strategies.

## 7. Risks and Mitigations

| Risk | Mitigation |
| :--- | :--- |
| **Bid Sniping** | Implement "Anti-sniping" (auto-extend timer by 2 mins if bid < 5 mins left). |
| **Data Scraping** | Rate limiting, Cloudflare WAF, obfuscate sensitive data until unlock. |
| **Payment Sync** | Webhooks + Polling fallback. Idempotency keys for transactions. |
| **Realtime Lag** | Optimistic UI updates, server timestamp authority. |

## 8. Folder Structure

```
src/
├── app/                  # Next.js App Router
│   ├── (public)/         # Public marketplace routes
│   ├── (auth)/           # Login/Signup routes
│   ├── dealer/           # Dealer dashboard routes
│   ├── admin/            # Admin console routes
│   └── api/              # API Route Handlers
├── components/
│   ├── ui/               # Reusable primitive components (buttons, inputs)
│   ├── features/         # Feature-specific complex components (AuctionCard, DealFlow)
│   └── layout/           # Shared layout components (Navbar, Sidebar)
├── lib/
│   ├── supabase/         # Supabase clients (Server/Client/Admin)
│   ├── utils.ts          # Helper functions
│   └── validations/      # Zod schemas
├── types/                # TypeScript interfaces
└── modules/              # Domain logic (Services, DTOs) - Optional for larger complexity
    ├── listings/
    ├── auctions/
    └── payments/
```
