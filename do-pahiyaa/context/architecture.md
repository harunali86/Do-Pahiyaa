# Architecture Overview: Do-Pahiyaa

## Mission
Next.js SaaS platform for motorcycle lead management and monetization (C2C & Dealer).

## Tech Stack
- **Framework**: Next.js 15+
- **Database**: Supabase (PostgreSQL) + RLS
- **Auth**: Supabase Auth (OTP via WhatsApp)
- **Payments**: Razorpay
- **Sync**: GitHub Actions CI/CD

## Core Modules
- **Monetization Engine**: ₹49 Lead Unlock system.
- **Lead Allocation**: Matching buyers to dealers by city/brand.

## Data Flow
Buyer -> Lead Table -> Dealer Alert -> Payment -> Lead Unlock
