# DO PAHIYAA - Project Context & Memory

> **Note for AI:** This file is the single source of truth for current project state, architectural decisions, and pending tasks. Read this FIRST to understand the context of this project.

## 🚀 Current Project Status (As of Feb 23, 2026)
We are in the final stages of the **₹49 C2C Monetization Engine** and **Auth Refactoring**. The system is moving from Email/Password to a unified **WhatsApp OTP-first** flow.

### Key Accomplishments:
1.  **OTP Authentication Flow:**
    *   Refactored `SignupPage` and `LoginPage` to prioritize WhatsApp OTP.
    *   Signup now requires mandatory `Full Name` and optional `Email`.
    *   Backend `/api/v1/auth/otp/verify` implements "Shadow Login" (auto-creates users/profiles on first OTP verify).
    *   WhatsApp Template `dopahiyaa_otp` is configured on Meta Business Suite (Category: Authentication, Code Delivery: Copy Code, Language: `en`).
2.  **Lead Capture & Monetization:**
    *   `LeadCaptureModal` updated to handle unauthenticated users. 
    *   Redirects to `/auth/login` with a clear toast message instead of showing generic payment errors.
    *   Backend for Buyer Unlock (₹49) is integrated with Razorpay.
3.  **Admin & Role Systems:**
    *   Refined `getUserRoleAction` to normalize `super_admin` role.
    *   Fixed redirection logic for Admin Dashboard.
4.  **Database & Infrastructure:**
    *   Fixed `profiles` table RLS policies for `INSERT`.
    *   Resolved `auth_otp_requests` schema cache issues by omitting `ip_address` in non-audit traits.

---

## 🛠 Tech Stack & Architecture
- **Frontend:** Next.js (App Router), Tailwind CSS, Lucide Icons, Sonner Toasts.
- **Backend:** Supabase (Auth, DB, Storage, RPCs).
- **Communication:** WhatsApp Cloud API (Meta Graph v21.0).
- **Payments:** Razorpay (C2C Unlocks).
- **Architecture:** 
    *   `src/lib/services`: Core logic (OTP, WhatsApp, Payment).
    *   `src/app/api/v1`: Endpoint implementation.
    *   `src/components`: UI components (LeadCapture, OTPLoginForm).

---

## 📋 End-to-End Testing Roadmap (Manual)

### 1. Unified Authentication (Sign-up/Login)
- [ ] **Individual Signup:** Enter Name, Mobile -> Receive OTP -> Verify -> Redirect to Home.
- [ ] **Dealer Signup:** Enter Name, Mobile -> Receive OTP -> Verify -> Enter Business Details -> Redirect to Dealer Dashboard.
- [ ] **Existing User Login:** Enter Mobile -> OTP -> Direct Dashboard/Home redirect.

### 2. Marketplace & Lead Capture
- [ ] **Public View:** Anonymous user sees "Contact Seller (Pay ₹49)".
- [ ] **Auth Enforcement:** Clicking "Pay ₹49" as anonymous -> Redirect to Login Page.
- [ ] **Lead Purchase:** Authenticated buyer pays ₹49 -> Contact details reveal -> SMS/WhatsApp notification to dealer.

### 3. Dealer & Admin Dashboard
- [ ] **Dealer Leads:** Bought leads visible in Dealer's "Purchased Leads" section.
- [ ] **Admin Control:** Super Admin can see all listings, users, and transactions.

---

## ⚙️ Key Configurations
- **WABA ID:** (See `.env.local`)
- **Phone Number ID:** (See `.env.local`)
- **WhatsApp Template:** `dopahiyaa_otp`
- **Rate Limit:** 20 OTPs per hour (per phone number).
- **GitHub CLI (gh)**: `gh` is installed and authenticated for `harunali86`. Use it for PRs and checking CI/CD errors (`gh run view`).
- **High-Performance Development Protocols**:
    *   **TDD (Red-Green-Refactor)**: Mandatory for all new service logic.
    *   **Micro-Tasking**: All `implementation_plan.md` tasks must be < 5 mins.
    *   **Continuous Profiling**: Database and API bottlenecks must be benchmarked.
- **Vercel CLI**: Authenticated for `harunali86`. Use `vercel logs` or `vercel inspect` to debug build failures.

---

## ⚠️ Known Gotchas
- Meta Sandbox restricts OTP sending to verified "Test Numbers" only until Business Verification is complete.
- OTP Language must be exactly `en` (English) in the API call to match the Dashboard.
