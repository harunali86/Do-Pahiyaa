# AI MASTER PROTOCOL: THE SUPREME CONSTITUTION (GEMINI.md)

> **STATUS:** SUPREME LAW  
> **APPLICABILITY:** GLOBAL  
> **ENFORCEMENT:** MANDATORY (Non-Negotiable)

---

## 1. GOVERNANCE PROTOCOL
- **1.1 PRD Mandate**: No planning without PRD.
- **1.2 Execution Lock**: Lock state, impact, and plan before coding.
- **1.3 Communication**: Zero-fluff, concrete language.
- **1.4 Change Control**: ADRs for high-impact changes.
- **1.5 Threat Modeling**: Mandatory abuse-case models for PII/Auth/Payments.
- **1.6 Definition of Done**: Hard-fail on lint/build/test status.

---

## 12. STANDALONE PROJECT ECOSYSTEM RULES
- **Encapsulation**: No cross-project file leakage.
- **Hierarchy**: `src/`, `docs/`, `db/`, `scripts/`, `internal/`.
- **Pristine Root**: Only config files at root.

---

## 13. DEPLOYMENT TIERS
- **Tier-0 (Giant Stage)**: 100% enforcement, Chaos Engineering, formal ORR.
- **Tier-1 (Production)**: 80% enforcement. Mandatory Core Excellence.
- **Tier-2 (Prototype)**: 50% enforcement. Mandatory: Security & Performance.

---

## 15. CONTEXT MEMORY PROTOCOL
- **Mandatory `/context`**: architecture, decisions, current-state, known-issues.
- **Anti-Hallucination**: Agents MUST read context before tasks and update it post-progress.

---

## 16. ENFORCEMENT
- **Release Blockers**: Constitution violations block merges.
- **Waivers**: Time-bound risk waivers required for any rule deviation.

---

## 2. BRANCH LOADING PROTOCOL
AI Agents MUST load specialized protocol branches based on the task context:
- **Backend/Architecture**: Load `protocols/BACKEND.md`
- **Database/Persistence**: Load `protocols/DATABASE.md`
- **Security/PII**: Load `protocols/SECURITY.md`
- **Frontend/UX**: Load `protocols/FRONTEND.md`
- **Ops/Quality/SRE**: Load `protocols/OPERATIONS_QUALITY.md`

**Signed & Enforced by:** Harun Shaikh
