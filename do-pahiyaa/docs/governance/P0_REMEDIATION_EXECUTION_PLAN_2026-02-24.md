# P0 Remediation Execution Plan (2026-02-24)

Scope: Immediate production-blocking gaps identified in deep scan.

Reference baseline: `do-pahiyaa/docs/governance/DEEP_SCAN_PRD_GLOBAL_RULES_2026-02-24.md`

---

## Track A — Secrets Hygiene (Critical)

### Tasks
- Redact plaintext secrets from tracked docs/artifacts.
- Keep only placeholders in generated test config files.
- Enforce “no-secrets-in-repo” check in pre-merge workflow.

### Exit Criteria
- No live token/key patterns in tracked files under `do-pahiyaa/`.
- Governance docs reference secure local stores only.

---

## Track B — PRD API Surface Completion (Critical)

### Missing High-Priority API Groups
- Admin:
  - `GET /api/admin/users`
  - `PATCH /api/admin/users/:id/status`
  - `PATCH /api/admin/users/:id/role`
  - `GET /api/admin/dealers`
  - `PATCH /api/admin/dealers/:id/verification`
  - `PATCH /api/admin/dealers/:id/plan`
  - `POST /api/admin/dealers/:id/credits/adjust`
  - `GET /api/admin/listings`
  - `PATCH /api/admin/listings/:id/moderate`
  - `GET /api/admin/leads`
  - `PATCH /api/admin/leads/:id/status`
  - `GET /api/admin/deals`
  - `PATCH /api/admin/deals/:id/state`
  - `POST /api/admin/auctions`
  - `PATCH /api/admin/auctions/:id/control`
  - `GET /api/admin/revenue/summary`
  - `POST /api/admin/notifications/broadcast`
  - `PATCH /api/admin/settings`
  - `GET /api/admin/audit-logs`
- Dealer:
  - `GET /api/dealer/dashboard`
  - `GET /api/dealer/inventory`
  - `POST /api/dealer/listings`
  - `GET /api/dealer/leads`
  - `POST /api/dealer/leads/unlock`
  - `GET /api/dealer/plan`
  - `POST /api/dealer/plan/topup`
  - `GET /api/dealer/analytics`
- Marketplace:
  - `GET /api/listings/:id`
  - `POST /api/offers`
  - `PATCH /api/offers/:id/counter`

### Implementation Rules
- Use unified API envelope via `apiSuccess`/`apiError`.
- Use strict input validation (`zod`) on write routes.
- Enforce role + ownership checks on all writes.
- Add idempotency-key handling for critical mutations.

### Exit Criteria
- PRD minimum API set exists and is routable.
- Contract tests added/updated for client-facing endpoints.

---

## Track C — Plan Engine Schema Completion (Critical)

### Required Tables
- `dealer_plans`
- `dealer_entitlements_snapshot`
- `credits_ledger`
- `usage_counters_monthly`
- `billing_adjustments`

### Migration Strategy
- Append-only migrations.
- Expand → migrate backfill → contract where applicable.
- Add indexes for hot filters and relational joins.

### Exit Criteria
- All PRD plan-engine tables exist with FK/index policy.
- Runtime checks enforced from APIs/services.

---

## Track D — Auth Session Hardening (High)

### Tasks
- Review OTP verify session flow and finalize production-safe token handling.
- Ensure cookie/session policy aligns with global constitution.
- Remove fallback patterns that can weaken auth guarantees.

### Exit Criteria
- Auth flow documented and verified under enforced mode.
- No production path depends on weak fallback auth behavior.

---

## Track E — Context & Governance Completeness (High)

### Tasks
- Maintain all required context artifacts:
  - `context/architecture.md`
  - `context/decisions.md`
  - `context/current-state.md`
  - `context/known-issues.md`
- Add weekly governance review cadence.

### Exit Criteria
- Context memory protocol is fully satisfied and current.

