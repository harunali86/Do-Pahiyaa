# GEMINI_TASK_CHECKLIST.md

## PROJECT: Hybrid Bike Marketplace Platform
- **Status:** INITIALIZING
- **Current Phase:** Phase 1: Frontend Demo

---

### [ ] PHASE 0: INFRASTRUCTURE & DESIGN SYSTEM
- [ ] Establish Design Tokens in `globals.css` (Glassmorphism, High-contrast dark mode)
- [ ] Create Core UI Library (`src/components/ui/`)
- [ ] Setup Base Layout (`Navbar`, `Footer`, `Sidebar`)
- [ ] Expand Mock Data for Demo (`src/lib/demo/mock-data.ts`)

### [ ] PHASE 1: FRONTEND DEMO (Priority)
- [ ] **Public Marketplace**
    - [ ] Marketplace Landing Page (Hero + Categories)
    - [ ] Search & Filter List (Glassmorphic filters)
    - [ ] Bike Detail View (Gallery, Specs, Deal CTA)
- [ ] **Dealer Portal**
    - [ ] Dashboard Overview (Metrics + Lead conversion)
    - [ ] Lead Management Inbox
    - [ ] Inventory Management UI
- [ ] **Auction House**
    - [ ] Active Auctions Listing
    - [ ] Realtime-ready Auction Room UI
- [ ] **Admin Console**
    - [ ] System Moderation Overview
    - [ ] Global Settings & Announcements

### [ ] PHASE 2: DATABASE & CORE ENGINE
- [ ] Postgres Schema Migration (Supabase)
- [ ] RLS Policy Implementation
- [ ] API Module: Listings & Search (Postgres FTS)
- [ ] API Module: Deal & Offer Engine
- [ ] Razorpay Payment Integration (Leads & Booking)

### [ ] PHASE 3: REALTIME & HARDENING
- [ ] Supabase Realtime Auction Bidding
- [ ] Notification System (In-app + Email)
- [ ] Audit Logging & Security Hardening
- [ ] Performance Optimization & Scaling Docs

---
*Created by Gemini (Antigravity) on 2026-02-14*
