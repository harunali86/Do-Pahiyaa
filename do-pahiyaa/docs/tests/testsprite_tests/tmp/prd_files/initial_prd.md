# Admin Panel Upgrade: The "SaaS Command Center" (Completed)

## Goal
Build a **State-of-the-Art Admin Interface** that feels like a native app. Fast, keyboard-driven, and visually stunning. This is the "Next Level" requirement.

## Key Features

### 1. Global Command Palette (`Cmd+K`)
- **Library**: `cmdk`
- **Functionality**:
    - Navigation: Jump to any page (`G` then `D` -> Dashboard).
    - Actions: `Ban User`, `Approve Listing`, `Switch Theme`.
    - Search: Global database search (mocked for demo).
- **Design**: Floating modal, blurred backdrop, sleek list items.

### 2. "God Mode" Dashboard
- **Library**: `recharts`
- **Visuals**:
    - **Revenue Stream**: Gradient Area Chart (Total Transaction Volume).
    - **User Activity**: Heatmap or Bar Chart of active sessions.
    - **Live Feed**: A scrolling log of platform events (Websockets simulation).

### 3. Data Management (TanStack Style Views)
- **Advanced Tables**:
    - Sticky Headers.
    - Row Selection (Shift+Click).
    - Floating Bulk Action Bar (appears on selection).
    - "Quick Look" Drawer (Side panel for editing without leaving context).

## Tech Stack
-   **Icons**: `Lucide React`
-   **Charts**: `Recharts`
-   **Command Menu**: `cmdk`
-   **Styling**: `Tailwind CSS` + `Framer Motion` for layout transitions.

---

# Phase 1.6: Final Polish & Branding (Current)

## Theme Overhaul: "Superbike Orange"
-   **Objective**: Switch from "Medical Green" to a high-energy **Automotive Orange** (resembling KTM/Harley).
-   **Action**: Update `tailwind.config.ts` primary color palette.

## System UX Components (Missing Items)
-   **Toast Notifications**: `sonner` or custom implementation for non-blocking alerts.
-   **Confirmation Dialog**: Reusable modal for destructive actions.
-   **Empty State**: Polished SVG component for "No Results".

## Phase 2: Industry-Grade Backend Implementation (Completed)
- [x] **Schema Implementation**: Execute SQL from `SYSTEM_DESIGN.md` via Supabase Migrations.
- [x] **RLS Policies**: Apply strict policies. E.g., `dealers` can only view leads they have *paid* to unlock.
- [x] **Types**: Generate TypeScript definitions (`database.types.ts`) automatically.
- [x] **Service Layer Architecture**: Implemented `ListingService`, `LeadService`.
- [x] **API Route Handlers**: Implemented `/api/listings`, `/api/leads`.
- [x] **Data Migration**: Created `seed.js` for initial data.

## Phase 3: Lead-First UI Transformation (Completed)
- [x] **Home Page**: integrated real "Verified Inventory" with failover to demo data.
- [x] **Listing Details**: Implemented Dual-Mode (Real vs Demo) and Lead Capture Modal.
- [x] **Dealer Dashboard**: Connected to real `LeadService` stats and inbox.

## Phase 4: Full Lead Lifecycle Verification (Completed)
- [x] **Verification Script**: Test the full flow: Inquiry -> Dashboard -> Unlock.
- [x] **Manual Walkthrough**: ensure UX is smooth.

## Phase 5: Realtime & Integrations (Upcoming)
- [ ] **Razorpay**: Subscription Webhooks & Payment Events.
- [ ] **Realtime**: Admin Dashboard live feed using Supabase Channels.
