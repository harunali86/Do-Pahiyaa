# System Design: Do Pahiyaa (Lead-Driven Marketplace)

> **Status:** DRAFT  
> **Version:** 1.0.0  
> **Compliance:** GEMINI.md (Clean Architecture, Strict Security, Performance)

---

## 1. Executive Summary

**Do Pahiyaa** is a hybrid B2C/B2B marketplace connecting bike sellers with buyers, monetized through dealer subscriptions and high-intent lead unlocks.

**Core Value Proposition:**
- **Sellers:** Liquidity (Instant selling to dealers).
- **Buyers:** Verified inventory.
- **Dealers:** High-intent leads (no cold calling).

---

## 2. High-Level Architecture (Serverless Event-Driven)

```mermaid
graph TD
    Client[Next.js Client (Web/Mobile)]
    Edge[Cloudflare CDN + WAF]
    Vercel[Vercel Serverless Functions]
    
    subgraph "Backend Services (Supabase)"
        Auth[GoTrue Auth]
        DB[(PostgreSQL + RLS)]
        Storage[S3 Compatible Storage]
        Realtime[WebSockets Hub]
    end
    
    subgraph "External Integrations"
        Razorpay[Razorpay Subscriptions]
        WA[WhatsApp API]
    end

    Client -->|HTTPS| Edge
    Edge -->|Request| Vercel
    Vercel -->|SQL/RPC| DB
    Vercel -->|Auth| Auth
    Vercel -->|Webhooks| Razorpay
    DB -->|CDC Events| Realtime
    Realtime -->|Push Updates| Client
```

---

## 3. Tech Stack & Constraints

-   **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind, Shadcn UI.
-   **Backend:** Supabase (Postgres, Auth, Edge Functions).
-   **State Management:** React Server Components (Server State) + Zustand (Client State).
-   **Validation:** Zod (Strict Schema Validation).
-   **Payments:** Razorpay (Subscriptions & On-demand payments).
-   **Infrastructure:** Vercel (Hosting), GitHub (CI/CD).

---

## 4. Database Design (3NF Normalized)

### 4.1 ER Diagram Overview
Core entities: `users`, `profiles` (extends users), `listings`, `leads`, `dealers` (extends profiles), `subscriptions`.

### 4.2 SQL Schema Specification

```sql
-- 1. USERS & PROFILES (Extends Supabase Auth)
create type user_role as enum ('admin', 'dealer', 'user');

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  role user_role default 'user',
  full_name text,
  phone text,
  avatar_url text,
  is_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. DEALER METADATA (1:1 with Profiles where role='dealer')
create table public.dealers (
  profile_id uuid references public.profiles(id) on delete cascade primary key,
  business_name text not null,
  gst_number text,
  showroom_address text,
  subscription_status text default 'inactive', -- active, past_due, canceled
  credits_balance int default 0, -- For unlocking leads
  verified_at timestamptz
);

-- 3. LISTINGS (Bike Inventory)
create type listing_status as enum ('draft', 'published', 'sold', 'archived', 'rejected');

create table public.listings (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references public.profiles(id) not null,
  title text not null,
  make text not null,       -- e.g., Royal Enfield
  model text not null,      -- e.g., Classic 350
  year int not null,
  price numeric(12, 2) not null,
  kms_driven int not null,
  city text not null,
  description text,
  specs jsonb default '{}'::jsonb, -- Flexible specs (color, engine, etc.)
  images text[] default '{}',      -- Array of Supabase Storage URLs
  status listing_status default 'draft',
  is_company_listing boolean default false, -- For "Our Store"
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for Dashboard Performance
create index idx_listings_seller on public.listings(seller_id);
create index idx_listings_status on public.listings(status);
create index idx_listings_market on public.listings(make, model, city) where status = 'published';

-- 4. LEADS (The Core Monetization Asset)
create type lead_status as enum ('new', 'unlocked', 'contacted', 'converted', 'closed');

create table public.leads (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.listings(id) not null,
  buyer_id uuid references public.profiles(id) not null,
  message text,
  status lead_status default 'new',
  created_at timestamptz default now(),
  
  -- Constraints to prevent duplicate leads from same user
  unique(listing_id, buyer_id)
);

-- 5. UNLOCK EVENTS (Monetization Tracking)
create table public.unlock_events (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references public.leads(id) not null,
  dealer_id uuid references public.dealers(profile_id) not null,
  cost_credits int not null,
  unlocked_at timestamptz default now()
);

-- 6. SUBSCRIPTIONS (Razorpay Mapping)
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  dealer_id uuid references public.dealers(profile_id) not null,
  razorpay_sub_id text unique not null,
  plan_id text not null,     -- basic, pro, enterprise
  start_date timestamptz not null,
  end_date timestamptz not null,
  status text not null,      -- active, authenticated, completed, expired
  created_at timestamptz default now()
);
```

### 4.3 Row Level Security (RLS) Policies (Strict)

| Table | Policy Name | Definition |
| :--- | :--- | :--- |
| `profiles` | `Public Read` | `true` (Anyone can read user names/avatars) |
| `profiles` | `Self Update` | `auth.uid() = id` |
| `listings` | `Public Read` | `status = 'published'` |
| `listings` | `Owner Manage` | `auth.uid() = seller_id` |
| `leads` | `Admin Read` | `auth.jwt() ->> 'role' = 'admin'` |
| `leads` | `Dealer Unlock` | `exists (select 1 from unlock_events where lead_id=leads.id and dealer_id=auth.uid())` |

---

## 5. Folder Structure (Clean Architecture)

```
src/
├── app/
│   ├── (public)/           # Marketplace (SEO Optimized)
│   │   ├── listing/[id]/
│   │   ├── search/
│   │   └── page.tsx
│   ├── (auth)/             # Login/Signup/Forgot-Password
│   ├── admin/              # Admin Dashboard (Protected)
│   ├── dealer/             # Dealer Portal (Protected)
│   ├── api/                # Route Handlers (Controllers)
│   │   ├── listings/
│   │   ├── leads/
│   │   └── webhooks/
│   └── layout.tsx
├── components/
│   ├── core/               # Shadcn UI Primitives
│   ├── domain/             # Business Logic Components (ListingCard, LeadTable)
│   └── layout/             # Navbar, Sidebar, Footer
├── lib/
│   ├── db/                 # Typed Supabase Client
│   ├── services/           # Business Logic Layer (See below)
│   ├── validations/        # Zod Schemas
│   └── utils.ts
├── types/
│   └── database.types.ts   # Generated Types from SQL
└── hooks/                  # Custom React Hooks
```

---

## 6. Business Logic Layer (Services Pattern)

**Rule:** `app/api` routes MUST NOT contain business logic. They only parse requests and call Services.

### 6.1 `ListingService`
- `createListing(userId, data)`: Validates images, sanitizes inputs, inserts DB.
- `searchListings(filters)`: Optimized query with pagination and full-text search.

### 6.2 `LeadService`
- `createLead(buyerId, listingId, msg)`: Checks if lead exists, Inserts, Triggers Notification.
- `unlockLead(dealerId, leadId)`: Checks credit balance, Deduts credits, Records `unlock_event`, Updates Lead status.

### 6.3 `BillingService`
- `syncSubscription(webhookData)`: Updates local subscription status based on Razorpay events.

---

## 7. API Specification (Example)

**Standard Response Wrapper:**
```typescript
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
```

**Endpoint:** `POST /api/leads/unlock`

**Request:**
```json
{
  "leadId": "uuid-1234"
}
```

**Zod Validator:**
```typescript
const UnlockLeadSchema = z.object({
  leadId: z.string().uuid()
});
```

**Logic Flow:**
1. Auth Guard (Verify User is Dealer).
2. Validate Input (`leadId`).
3. Call `LeadService.unlockLead()`.
    - Check if already unlocked.
    - Check credits.
    - Transaction: (Deduct Credit + Insert Grant).
4. Return `{ success: true, data: { phone: "+91..." } }`.

---

## 8. Realtime & Notifications

- **Admin Dashboard:** Subscribes to `INSERT` on `leads` table.
    - *Action:* "New Lead Alert" toast.
- **Dealer Dashboard:** Subscribes to `UPDATE` on `leads` (where `id` is in their unlocked list).
    - *Action:* "Buyer replied" indicator.

---

## 9. Security & Compliance (GEMINI Rules)

1.  **Rate Limiting:**
    -   `upstash/ratelimit` on all public API routes (e.g., 10 req/min for Login).
2.  **Input Serialization:**
    -   All POST bodies parsed via strict Zod schemas. Strip unknown keys.
3.  **Role Guard:**
    -   Middleware (`middleware.ts`) enforces `role` from JWT claims before accessing `/admin/*` or `/dealer/*`.
4.  **Audit Logs:**
    -   Critical actions (Unlock, Ban, Delete) logged to `audit_logs` table.

---

## 10. Deployment Strategy

1.  **Environment Variables (`.env.local`)**:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=...
    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
    SUPABASE_SERVICE_ROLE_KEY=...
    RAZORPAY_KEY_ID=...
    RAZORPAY_KEY_SECRET=...
    RAZORPAY_WEBHOOK_SECRET=...
    ```
2.  **Build Check**: `npm run type-check` before every commit.
3.  **Database Migration**:
    -   Use `supabase migration` CLI for all schema changes.
    -   Never edit tables in Dashboard GUI in production.

---

## 11. Scaling Plan (Future)

-   **Search:** Move from Postgres ILIKE to **Typesense** / **Meilisearch** if listings > 50k.
-   **Images:** Use Cloudflare Images (Resizing/Optimization) instead of raw S3 events.
-   **SSR:** Implement `stale-while-revalidate` caching for Listing Details pages.
