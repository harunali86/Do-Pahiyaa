# Do Pahiyaa PRD vs Global GEMINI Rules (Comparison)

> Latest full analysis: `do-pahiyaa/docs/governance/DEEP_SCAN_PRD_GLOBAL_RULES_2026-02-24.md`

## Inputs Compared
- PRD: `do-pahiyaa/docs/do-pahiyaa-prd.md`
- Global Rules: `/home/harun/.gemini/GEMINI.md`

## Alignment Summary
- **Strongly aligned**
  - Admin end-to-end controls (users, dealers, listings, leads, deals, auctions, billing, notifications, audit logs)
  - Dealer plan/entitlement enforcement
  - API surface definition with role/ownership checks and validation
  - Phased delivery model and release blockers
  - Auth enforcement target state
- **Partially aligned**
  - Reliability controls (PRD has non-functional gates; global rules are more detailed on SLI/SLO, incident ops, chaos, DR cadence)
  - Security and supply-chain controls (PRD states outcomes; global rules define stricter operational controls)
  - Performance/cost governance (PRD gates exist; global rules include deeper budgets and FinOps policy)
- **Needs explicit project carry-over from global**
  - Threat-model gate before major feature work
  - Time-bound waiver protocol format
  - Context-memory updates (`/context` maintenance discipline)
  - Operational CLI verification discipline (`gh`, `vercel`) where applicable

## Practical Governance Decision
- `do-pahiyaa/docs/do-pahiyaa-prd.md` remains the **product execution source**.
- `GEMINI.md` remains the **engineering constitution source**.
- Delivery is compliant when PRD execution is performed under global GEMINI guardrails.
