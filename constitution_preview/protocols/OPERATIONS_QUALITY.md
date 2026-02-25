# PROTOCOL: OPERATIONS, RELIABILITY & QUALITY (BRANCH)

> **NATURE**: Specialized System Design Rules  
> **CONTEXT**: Loaded for SRE, DevOps, Testing, or Operational Readiness tasks.

---

## 6. RELIABILITY, SRE & OPERATIONS

### 6.1 SLI/SLO & Error Budgets
- Baselines: Availability >= 99.95% (Tier-0), API p95 <= 300ms, p99 <= 800ms.
- **Freeze Policy**: Release freeze at 100% budget burn.

### 6.2 Observability
- Structured JSON logs with `traceId`, `actorId`, and resource identifiers.
- Metrics + Traces + Logs correlation is mandatory.

### 6.3 Incident Management
- Sev matrix (SEV-1..SEV-4), escalation tree, and postmortems for SEV-1/2.

### 6.4 Resilience Patterns
- Timeout + Retry + Circuit-breaker + Bulkhead isolation for external dependencies.

### 6.5 Health & Disaster Recovery
- Backup-restore drill: Monthly. Full DR simulation: Quarterly.
- Measured `RPO`/`RTO` documentation is mandatory.

### 6.6 Chaos Engineering
- Controlled fault-injection in non-prod (Monthly) and production-safe scope (Quarterly).

---

## 8. RELEASE ENGINEERING & DEVOPS
- **CI/CD Gates**: Type checks, lint, unit/integration tests, security scan, build.
- **Progressive Delivery**: Prefer canary/blue-green rollouts.
- **Environment**: Strict dev/stage/prod separation. No production debug flags.
- **Feature Flags**: Every flag needs an owner, expiry date, and cleanup policy.
- **IaC**: Infrastructure must be reproducible; no manual production drift.

---

## 9. FINOPS & COST GOVERNANCE
- Monthly budgets per environment; cost alerts with owner/remediation runbook.
- Auto-cleanup policy for stale resources/orphan snapshots.

---

## 10. QUALITY ENGINEERING
- Unit + Integration + E2E coverage for critical journeys.
- Regression Rule: Every bug fix MUST include a regression test.
- Contract Testing: Mandatory for external/client-facing interfaces.

---

## 11. DOCUMENTATION & RUNBOOK STANDARD
- Required: PRD, Architecture Diagram, ADRs, API docs, Runbooks.
- Every module and alert must have a named owner/accountable team.
