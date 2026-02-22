# PROJECT_CONTEXT.md — Hybrid Bike Marketplace (Do Pahiyaa)

## 1) Project Identity
- **Name:** Do Pahiyaa
- **Repo Root:** `/home/harun/codex`
- **Scope:** This repository is only for the Hybrid Bike Marketplace platform.

## 2) Product Goal
Build an industry-grade marketplace ecosystem with:
- B2C bike buying/selling
- B2B dealer lead workflows
- Real-time auction and bid lifecycle
- Admin control plane for operations, pricing, moderation, and analytics

## 3) Current Technical Stack
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend/Data:** Supabase (Postgres, Auth, Realtime, Storage, RPC)
- **Payments:** Razorpay (planned/integration phases by module)
- **Hosting/Delivery:** Vercel + Cloudflare

## 4) Active Business-Critical Workstreams
1. **Dealer Lead Pre-Purchase + Auto Allocation**
   - Dealers buy filtered lead subscriptions (city/brand/model/date/type).
   - New incoming leads are auto-delivered in near real-time against active quota.
2. **Dynamic Pricing Rules**
   - Admin-configurable base price, surcharge logic, geo/date modifiers, bulk discounts.
3. **Dealer Lead Inbox Correctness**
   - Locked vs unlocked segregation must be strict.
   - No cross-tab leakage.
4. **Admin Operability + Performance**
   - End-to-end control required.
   - Heavy screens must be optimized (pagination/virtualization/dynamic loading).

## 5) Current Delivery Mode
- Hybrid mode: mock/demo-friendly UX with progressive real backend wiring.
- Until full cutover, avoid breaking demo flows while implementing production-safe architecture.

## 6) Non-Negotiable Constraints
- Follow `AGENTS.md` for workspace scope and file placement.
- Follow `GEMINI.md` as technical constitution.
- Follow `docs/governance/PERFORMANCE_GLOBAL_RULES.md` for optimization standards.
- Do not create unrelated project artifacts in this repo.

## 7) Source-of-Truth Documents (Read First)
1. `AGENTS.md`
2. `GEMINI.md`
3. `docs/plans/REFACTOR_PLAN.md`
4. `docs/architecture/SYSTEM_DESIGN.md`
5. `docs/governance/PERFORMANCE_GLOBAL_RULES.md`
6. `docs/runbooks/SUPABASE_PHASE17_EXECUTION_RUNBOOK.md`

## 8) Engineering Quality Gates
- Type-safe code, no hidden `any`-driven regressions.
- Backward compatible changes unless explicitly approved.
- For data-model updates: add new migrations only, never rewrite old migrations.
- Validate with `npm run check-types` and `npm run build` before claiming completion (when feasible).

## 9) Change Execution Protocol
For non-trivial tasks, always provide:
1. What is understood (current vs desired)
2. Impact analysis (what can break)
3. Step-by-step plan
4. Explicit proceed confirmation

## 10) Definition of Done (Module Level)
- Workflow complete (not just UI)
- Error states handled
- Role/permission boundaries preserved
- Performance impact reviewed
- Docs/runbook updated for handoff
