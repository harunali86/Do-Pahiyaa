# Deep Scan Report: PRD vs Global Constitution vs Codebase

Date: 2026-02-24  
Project: `do-pahiyaa`  
Scope: Product PRD compliance + engineering constitution compliance + MCP ecosystem readiness

Execution follow-up: `do-pahiyaa/docs/governance/P0_REMEDIATION_EXECUTION_PLAN_2026-02-24.md`

---

## 1) Inputs Used

- Product PRD: `do-pahiyaa/docs/do-pahiyaa-prd.md`
- Project handoff: `do-pahiyaa/docs/GEMINI_HANDOFF.md`
- Global constitution (authoritative): `/home/harun/.gemini/GEMINI.md` (429 lines)
- Project override constitution: `GEMINI.md` (project-level override rules)
- Codebase scan:
  - API routes: `src/app/api/v1/**/route.ts`
  - Services: `src/lib/services/**/*.ts`
  - DB migrations: `supabase/migrations/*.sql`
  - Context memory: `context/*.md`
- Runtime checks:
  - Build gates: `check-types`, `lint`, `build`
  - MCP server liveness probes (sentry, supabase, github, playwright, testsprite, vercel)

---

## 2) Executive Summary

### What is strong

- Type check/build pipeline is currently passing locally.
- API versioning pattern is standardized (`/api/v1/*`).
- Service-layer structure exists for most core domains (`src/lib/services`).
- Payment webhook includes signature validation and idempotency-oriented transaction checks.
- Core SaaS modules exist in UI structure (admin, dealer, buyer, auctions, leads, billing).

### What is blocking for production-grade constitution compliance

1. **Secrets exposure in repository artifacts** (critical).
2. **PRD required API surface is only partially implemented** (critical).
3. **PRD plan-engine required tables are mostly missing** (critical).
4. **Auth/session model conflicts with strict token-storage policy** (high).
5. **Mandatory `/context/known-issues.md` artifact missing** (high).
6. **Operational governance depth (CI gates, incident playbook, SLO/DR discipline) is incomplete** (high).

---

## 3) Detailed Findings

## 3.1 PRD API Surface Coverage

- PRD defines **32 minimum production API entries**.
- Implemented route handlers currently: **14**.
- Missing large portions of admin/dealer/deals/offers API contract in route layer.
- Some business functions exist as server actions, but PRD contract explicitly requires external/client-facing API surface.

Status: **❌ Gap**

---

## 3.2 PRD Plan Engine Table Coverage

PRD-required tables:

1. `dealer_plans` ❌ missing  
2. `dealer_subscriptions` ✅ present  
3. `dealer_entitlements_snapshot` ❌ missing  
4. `credits_ledger` ❌ missing  
5. `usage_counters_monthly` ❌ missing  
6. `billing_adjustments` ❌ missing

Status: **❌ Gap**

---

## 3.3 Security & Secrets

Sensitive values are present in tracked docs/tmp artifacts:

- `docs/governance/GEMINI_SECRETS.md`
- `docs/tests/testsprite_tests/tmp/config.json`

This violates the constitution policy: no secrets in repo/docs/logs.

Status: **❌ Critical**

---

## 3.4 Auth & Session Posture

Observed flow:

- OTP verify route returns `session` object.
- Client uses `supabase.auth.setSession(...)` in browser.

Risk:

- Browser-side session persistence can conflict with strict policy forbidding sensitive auth token persistence in local storage for production-sensitive auth.

Status: **🟡 High-risk design**

---

## 3.5 Context Memory Protocol

Required by global constitution:

- `context/architecture.md` ✅
- `context/decisions.md` ✅
- `context/current-state.md` ✅
- `context/known-issues.md` ❌ missing

Status: **❌ Gap**

---

## 3.6 API Governance Consistency

- Standard API envelope helper exists (`src/lib/api-response.ts`).
- Multiple routes still return raw `NextResponse.json(...)` with custom shapes.
- Validation (`zod`) is inconsistent across route handlers.
- Critical mutation idempotency-key pattern is not consistently enforced at API contract boundary.

Status: **🟡 Partial**

---

## 3.7 Security Headers / CSRF / CORS

- No explicit production security header policy found in `next.config.ts`.
- No explicit route-level CORS allowlist or CSRF controls were found for cookie-protected write endpoints.

Status: **🟡 Partial / Missing hardening**

---

## 3.8 Observability & Ops Discipline

- Structured JSON logging with trace/correlation IDs is not standardized.
- SLO/error budget/DR/chaos evidence is not codified in project docs.
- Local CI workflow definitions under project path are absent.

Status: **❌ Gap**

---

## 3.9 MCP Ecosystem Status

Liveness probe status:

- sentry ✅
- supabase ✅
- github ✅
- playwright ✅
- testsprite ✅
- vercel ✅ (server starts, but token currently placeholder in secrets env)

Notes:

- Runtime MCP resource introspection from this execution environment returned no enumerated resources/templates.
- Protocol-level tools/list handshake did not return responses within timeout in this environment, so deep MCP tool-call audit is pending dedicated MCP client runtime.

Status: **🟡 Usable with partial runtime visibility**

---

## 4) Priority Improvement Roadmap

## P0 (Immediate: security + contract safety)

1. Remove/redact secrets from tracked docs/tmp files and rotate exposed credentials.
2. Freeze/clean any generated artifacts that can reintroduce secrets (`docs/tests/testsprite_tests/tmp/*`).
3. Implement missing critical PRD APIs for admin/dealer/deals/offers or formally revise PRD contract.
4. Add `context/known-issues.md` and enforce updates per major task.

## P1 (Near-term: production hardening)

1. Complete plan engine schema (`dealer_plans`, `credits_ledger`, etc.).
2. Standardize all API responses via envelope helper and unified error handling.
3. Enforce idempotency-key at API boundary for payment/unlock/refund/settlement routes.
4. Harden auth session strategy to align with strict token-storage policy.
5. Add explicit security headers/CORS policy and CSRF safeguards.

## P2 (Operational maturity)

1. Add CI workflow gates: typecheck, lint, tests, build, security scan.
2. Add incident playbook + SLO/SLI definitions + error budget policy doc.
3. Add traceable structured logging and correlation IDs in API path.
4. Add MCP-assisted periodic governance audits (weekly compliance runbook).

---

## 5) Final Assessment

Current state is **feature-rich but governance-incomplete** for strict production constitution standards.  
The fastest path is to execute P0 security/contract work immediately, then P1 schema/auth/API hardening, then P2 ops maturity.
