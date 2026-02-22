# Do Pahiyaa — Industry Grade Audit (2026-02-19)

## 1) Current Build Health

- `npm run check-types`: ✅ pass
- `npm run lint`: ✅ pass (warnings remain, no blocking errors)
- `npm run build`: ✅ pass

This means repo is now in a shippable compile state, but compile success ≠ end-to-end product completion.

---

## 2) End-to-End Workflow Reality Check

### What is implemented (working baseline)

- Lead creation + lead unlock APIs exist:
  - `src/app/api/leads/route.ts`
  - `src/app/api/leads/unlock/route.ts`
- Listing read/create API exists:
  - `src/app/api/listings/route.ts`
- Billing order/verify + Razorpay webhook exist:
  - `src/app/api/billing/order/route.ts`
  - `src/app/api/billing/verify/route.ts`
  - `src/app/api/webhooks/razorpay/route.ts`
- Dealer lead/inventory/dashboard screens are connected to DB in major paths:
  - `src/app/dealer/dashboard/page.tsx`
  - `src/app/dealer/leads/page.tsx`
  - `src/app/dealer/inventory/page.tsx`

### Hard gaps vs “industry-grade end-to-end”

1. **Admin auction control not implemented**
   - `src/app/admin/auctions/page.tsx` is only placeholder text.

2. **Admin audit logs not real**
   - `src/app/admin/audit-logs/page.tsx` uses hardcoded mock `logs` array.

3. **Auction discovery still demo-data based**
   - `src/app/auctions/page.tsx` uses `demoAuctions` from `src/lib/demo/mock-data.ts`.

4. **Auction result page is static demo**
   - `src/app/auctions/[id]/result/page.tsx` has hardcoded winner and amount.

5. **Buyer and seller dashboards are mock UI**
   - `src/app/buyer/dashboard/page.tsx`
   - `src/app/seller/dashboard/page.tsx`

6. **Dealer subscription page is mock**
   - `src/app/dealer/subscription/page.tsx` has static plans/history, no live billing wiring.

7. **Offer/counter-offer lifecycle incomplete at product surface**
   - `src/lib/services/deal.service.ts` exists, but there are no dedicated API routes for full offer lifecycle (create/counter/accept/reject/history) and no full UI workflow pages wired.

---

## 3) Why Admin Panel Feels Slow

### Primary causes in current code

1. **Moderation loads full listing dataset**
   - `src/app/admin/moderation/page.tsx` fetches all listings with no server pagination.
   - On large data, this becomes heavy network + hydration + client filter cost.

2. **Heavy client-side tables with rich DOM**
   - Large interactive tables in:
     - `src/components/admin/moderation/ModerationTable.tsx`
     - `src/components/admin/UsersClient.tsx`
     - `src/components/admin/leads/AdminLeadsTable.tsx`
   - No virtualization; rendering cost grows linearly with row count.

3. **Admin dashboard renders chart-heavy UI on first paint**
   - `src/components/admin/AdminRevenueChart.tsx`
   - `src/components/admin/UserGrowthChart.tsx`
   - `src/components/admin/SystemHealthGauge.tsx`
   - Recharts adds JS/hydration cost; build logs also show width/height warnings for chart containers.

4. **No caching strategy for expensive admin queries**
   - `src/lib/services/admin.service.ts` executes multiple live queries each request for dashboard/activity.

### P0 performance fixes (recommended order)

1. Add pagination + server-side filters to moderation endpoint/page.
2. Move table filters/search to server query layer (not only client filtering).
3. Lazy-load charts below fold (dynamic import, `ssr: false`) with skeletons.
4. Add cache/revalidate strategy for admin dashboard aggregates.

---

## 4) Global Rules Alignment Check

### Aligned

- Project scope is still Hybrid Bike Marketplace.
- Most architecture docs now exist under `docs/`.

### Not fully aligned yet

1. **Role model mismatch with requirement**
   - Requirement roles: Buyer, Seller, Dealer, Admin, Super Admin.
   - Current core enum in migrations is limited (`admin`, `dealer`, `user`), and middleware only treats `admin` specially:
     - `supabase/migrations/20260217_init_lead_engine.sql`
     - `src/middleware.ts`

2. **“Final SaaS” requirement not met due mock/demo sections**
   - Buyer/seller/auctions/audit portions still demo or placeholder as listed above.

3. **Workspace file-placement rule drift**
   - Some planning/config files are in repo root instead of `docs/` (per your AGENTS contract).

---

## 5) Priority Gap Backlog (Gemini Execution Sheet)

### P0 (must close for true production workflow)

- Implement real admin auction control (`start/pause/cancel/settle`) with API + DB state transitions.
- Replace mock admin audit logs with DB-backed query + filters + pagination.
- Convert `auctions/page.tsx` from demo to DB-backed listing pipeline.
- Replace static auction result page with real settlement state from DB.
- Implement full offers/deals API surface and connect UI flows end-to-end.
- Add `super_admin` role and enforce role matrix in middleware + APIs + policies.

### P1 (stability/performance hardening)

- Server pagination on moderation, leads, and any high-row admin views.
- Dynamic imports for heavy charts/components.
- Introduce request-level cache/revalidate for admin aggregate metrics.
- Convert `<img>` warnings to `next/image` on high-traffic pages.

### P2 (quality/compliance)

- Remove remaining mock data paths from production routes.
- Add full observability: structured logs, latency/error dashboards, audit event coverage for admin actions.

