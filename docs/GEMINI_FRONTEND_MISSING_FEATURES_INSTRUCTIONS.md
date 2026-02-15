# Gemini Instruction File — Do Pahiyaa Frontend Missing Features

You are implementing **frontend-only** work for the existing Next.js app.

## Project Context
- Project name: **Do Pahiyaa**
- Stack: **Next.js 16 (App Router) + Tailwind CSS + TypeScript**
- Current status: UI demo exists with mock data; backend integration is out of scope.
- Goal: Complete missing product-required UI screens/components for demo completeness.

## Non-Negotiable Constraints
- Do **not** add backend/API integration.
- Do **not** remove existing pages/components.
- Use **mock/static data only**.
- Keep current theme direction (teal/brand, avoid orange-dominant style).
- Preserve existing code style and component patterns.
- Ensure all pages are responsive (mobile-first).
- Add proper empty/loading/error states in UI (visual only).

---

## 1) Global Layout Missing

### 1.1 Footer (Mandatory)
Create a production-style footer component and wire it in global layout.

**Expected content blocks**
- Brand summary (Do Pahiyaa short text)
- Quick links (Marketplace, Sell, Auctions, Dealer, Admin)
- Company links (About, Careers, Contact)
- Legal links (Terms, Privacy, Refund Policy)
- Support links (Help Center, Trust & Safety, Report Issue)
- Social icons (X, Instagram, LinkedIn, YouTube)
- Newsletter/email input UI (visual only)
- Copyright row

**File targets**
- `src/components/common/Footer.tsx`
- Update `src/app/layout.tsx` to render footer under main content.

---

## 2) Authentication + Role Onboarding UI

Create standalone UI routes:
- `/auth/login`
- `/auth/signup`
- `/auth/forgot-password`
- `/auth/verify-otp` (UI simulation only)
- `/onboarding/role-select`
- `/onboarding/profile-setup`

**Requirements**
- Tab/segment option for Buyer/Seller/Dealer.
- Clear form validation states (client-side visual).
- Social login placeholders (Google/Apple buttons UI only).
- Success and error banners.

---

## 3) Buyer + Seller Product Flows (UI only)

### 3.1 Buyer Dashboard
Route: `/buyer/dashboard`

Sections:
- Saved listings
- Watchlist
- Offers sent
- Active deals timeline
- Recommended bikes

### 3.2 Seller Dashboard
Route: `/seller/dashboard`

Sections:
- My listings (draft/live/sold tabs)
- Incoming offers
- Counter-offer actions (UI)
- Deal progress cards

### 3.3 Seller Listing Management
Routes:
- `/seller/listings`
- `/seller/listings/new`
- `/seller/listings/[id]/edit`

Include:
- Multi-step listing form UI
- Image upload dropzone UI
- Preview pane
- Draft/publish buttons (no API)

---

## 4) Hybrid Model UI Missing

### 4.1 Lead Unlock Flow
- Add reusable modal component:
  - fee details
  - what gets unlocked
  - confirm/cancel states
  - success state

### 4.2 Contact Reveal Card
- Masked phone/email card state
- Revealed state after “mock unlock”

### 4.3 Booking Token Flow UI
Route: `/deals/[id]/token`
- payment summary card
- token amount
- payment status variants (pending/success/failed)

### 4.4 Deal Tracking Page
Route: `/deals/[id]`
- lifecycle stepper:
  - initiated
  - lead unlocked
  - token paid
  - inspection
  - completed/cancelled
- timeline with timestamps (mock)

---

## 5) Dealer Channel UI Missing

### 5.1 Subscription & Billing
Route: `/dealer/subscription`
- plan cards (Basic/Pro/Enterprise)
- current plan highlight
- invoice history table (mock)
- upgrade button states

### 5.2 Dealer Profile & Team
Route: `/dealer/profile`
- showroom details
- KYC badge/status UI
- team members table (UI only)

---

## 6) Auction UI Missing

### 6.1 Auction Rules Drawer
Add reusable side panel in auction pages:
- reserve price rules
- min increment
- anti-sniping rule explanation
- bidding etiquette

### 6.2 Enhanced Bid History
On `/auctions/[id]` add:
- sortable bid history list
- highlight user’s own bids
- outbid/winning chips

### 6.3 Auction Result & Settlement Screens
Routes:
- `/auctions/[id]/result`
- `/auctions/[id]/settlement`

Include:
- winner card
- final bid summary
- next steps cards
- downloadable invoice button UI

### 6.4 Auction Audit Timeline (UI)
- event timeline (start/pause/resume/end)
- actor + timestamp chips

---

## 7) Admin Panel Missing UI Modules

Create/complete pages:
- `/admin/revenue`
- `/admin/notifications`
- `/admin/audit-logs`
- `/admin/roles`
- `/admin/feature-flags`

**Expected UI**
- table-heavy management screens
- filter/search/sort bars
- side drawer detail views
- confirmation modal patterns

---

## 8) System-wide UX Completeness

### Required shared states/components
- Global empty state component
- Global error state component
- Global skeleton loaders
- Toast notifications component
- Confirmation dialog component

### Required pages
- `/about`
- `/contact`
- `/help`
- `/trust-safety`
- `/terms`
- `/privacy`
- custom `not-found` and friendly error page UI

### Mobile UX
- Add mobile bottom nav for buyer journey:
  - Home
  - Search
  - Sell
  - Auctions
  - Profile

---

## 9) Design Quality Bar

- Premium spacing rhythm (8px scale).
- Consistent card radius, border opacity, and shadows.
- Strong typography hierarchy (H1/H2/body/meta).
- Accessible contrast and keyboard focus states.
- Avoid visual clutter and duplicate CTAs.

---

## 10) Final Delivery Checklist

Before finishing, ensure:
- [ ] All above routes render without crash.
- [ ] Navigation links point to valid pages.
- [ ] No TypeScript errors.
- [ ] No ESLint errors.
- [ ] Responsive layout verified (mobile + desktop).
- [ ] Existing pages remain functional.

---

## Implementation Style
- Prefer reusable components under:
  - `src/components/common`
  - `src/components/ui`
  - `src/components/marketplace`
  - `src/components/auction`
  - `src/components/dealer`
  - `src/components/admin`
- Keep mock data centralized in:
  - `src/lib/demo/mock-data.ts`

Build everything as a polished demo-ready frontend handoff.
