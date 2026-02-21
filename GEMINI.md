# AI MASTER PROTOCOL: The Code Constitution (GEMINI.md)

> **STATUS:** SUPREME LAW  
> **APPLICABILITY:** GLOBAL (All Projects: Rentify, Medical, Cab, Portfolio, Marketplace)  
> **ENFORCEMENT:** MANDATORY for all AI Agents (Antigravity, Codex, Cursor, Windsurf)

This document defines the **Non-Negotiable Technical Standards** for this environment. Violations are critical failures.

---

## 0. APPLICABILITY & SCOPE
- **Core Rules:** Mandatory for ALL projects.
- **Stack Modules:** Apply only when specific tech (React, Docker, SQL, Supabase, etc.) is used.
- **Non-Blocking:** Missing tech NEVER disables core rules.

---

## 1. THE GOVERNANCE PROTOCOL (Control & Monitoring)

### 1.1 The Execution Lock (First Directive)
Before writing code, you MUST:
1. **State Understanding:** "What I have understood" (Current vs Desired).
2. **Analyze Impact:** "What will break?" (Dependencies, API contracts, DB integrity).
3. **Propose Plan:** Step-by-step Technical Roadmap.
4. **Wait for Permission:** "Do you want me to proceed?"

### 1.2 Communication
- **No Fluff:** Say "I will...", not "I will try to...".
- **Context First:** Read `PROJECT_CONTEXT.md` (or nearest context doc) before assumptions.

---

## 2. THE ARCHITECTURE PROTOCOL (Structure)

### 2.1 Clean Architecture (The "Traffic Cop" Rule)
- **Controllers/Route Handlers:** Routing, DTO Validation, HTTP status only. No business logic.
- **Services:** 100% business logic. Unit-testable.
- **Repositories/Data Layer:** Database abstraction and query concerns.

### 2.2 Global Handling
- **Exceptions:** Global exception filters/handlers (No raw stack traces to users).
- **Response Contract:** `{ success: boolean, data: any, error?: { code, message } }`.
- **Mandatory:** All external API endpoints must follow contract or documented equivalent.

### 2.3 Third-Party Interaction
- **Rule:** Never call vendor SDKs (Stripe, OpenAI, Razorpay, etc.) directly in controllers.
- **Pattern:** Wrap in Service/Adapter with retries, timeout, and typed error handling.

---

## 3. DATABASE PERFORMANCE & INTEGRITY

### 3.1 Indexing & Optimization
- **Mandatory:** Index foreign keys and filter/sort columns (`WHERE`, `ORDER BY`).
- **N+1 Ban:** No looped DB queries. Use batch loading, joins, or includes.

### 3.2 Transactional Integrity
- **Atomicity:** Multi-table writes MUST be transactional.
- **Safety:** ACID behavior with rollback on failure.

### 3.3 Migration Discipline
- **Rule:** Never edit old migrations. Always create new migration files.
- **Safety:** Flag and review destructive changes (`DROP`, irreversible transforms).

---

## 4. CONCURRENCY & DATA HANDLING

### 4.1 Locking Strategy
- **Optimistic:** Standard updates (`updated_at` / version checks).
- **Pessimistic:** Financial/inventory/auction critical paths (`FOR UPDATE` / RPC lock logic).

### 4.2 Pagination
- **Limit:** Max 100 rows per page by default.
- **Strategy:** Cursor pagination for large datasets (>10k rows); offset only for small datasets.

---

## 5. API DEFENSE LAYER (Security)

### 5.1 Rate Limiting (DDoS Protection)
- **Public:** 60 req/min
- **Authenticated:** 100 req/min
- **Sensitive actions:** 5 req/min

### 5.2 Input Security
- **Validation:** Whitelist DTO/schema validation; strip unknown fields.
- **Sanitization:** Parameterized queries (no SQL injection), XSS-safe rendering.

### 5.3 Headers & CORS
- **Security Headers:** Helmet-equivalent policy enabled in production stack.
- **CORS:** Explicit allowlist only. `origin: *` forbidden for production APIs.

---

## 6. AUTH & DATA PRIVACY

### 6.1 Token Storage
- **Rule:** HttpOnly secure cookies for access/session tokens in production web flows.
- **Forbidden:** LocalStorage token persistence for sensitive auth tokens.

### 6.2 Data Privacy
- **Logging:** Never log plaintext PII (email/phone/password/token).
- **Masking:** Mask sensitive fields in logs and diagnostics.

### 6.3 File Security
- **Validation:** MIME allowlist + file size limits.
- **Storage:** Signed URLs and private buckets for protected assets.

---

## 7. OBSERVABILITY & CACHING

### 7.1 Logs & Audit
- **Format:** Structured logs (JSON).
- **Traceability:** Include `traceId` and `userId` where available.
- **Audit:** Record all mutation events (who/what/when).

### 7.2 Caching Strategy
- **Assets:** CDN cache headers for static media.
- **APIs:** Cache heavy reads with explicit invalidation strategy.

---

## 8. ASYNC & BACKGROUND JOBS

### 8.1 Queue System
- **Rule:** Tasks expected to exceed 2s go to background jobs (emails, reports, broadcast jobs).
- **Resilience:** Retries + dead-letter handling.

---

## 9. DEPLOYMENT & DEVOPS

### 9.1 Secrets & Config
- **Secrets:** `.env` only for local. Never commit secrets.
- **Production:** Use managed secret store.
- **Shutdown:** Handle SIGTERM/SIGINT gracefully.

### 9.2 Containerization
- **Docker:** Multi-stage builds and non-root runtime when Docker is used.

---

## 10. API VERSIONING
- **Rule:** Public APIs should be versioned (`/api/v1`) or strongly versioned by contract policy.

---

## 11. QUALITY ASSURANCE

### 11.1 Self-Correction
- **Mandatory checks:** Run `lint`, `check-types`, and `build` before claiming done (when available).
- **Dependency Safety:** Ensure checks do not hide broken imports/contracts.

### 11.2 Testing Strategy
- **Regression Rule:** Every bug fix should include/adjust a test.
- **Critical Flows:** E2E tests for auth/payment/booking/deal lifecycle.

---

## 12. LEGACY COMPATIBILITY
- Preserve legacy domain rules when applicable.
- Keep locale-appropriate demo data where required by product context.

---

## 13. FRONTEND PERFORMANCE PROTOCOL

### 13.1 Code Splitting & Lazy Loading
- Mandatory: Use dynamic imports for heavy client modules (charts/modals/complex tables/editors).
- Priority: Only above-the-fold content loads initially.

### 13.2 List Virtualization
- Rule: Lists/tables expected to exceed 50 rows must use virtualization or strict server pagination.
- Goal: Avoid DOM bloat and hydration lag.

### 13.3 Asset & Image Optimization
- Rule: Use optimized image delivery (`next/image` or stack-equivalent) with proper `sizes`, `loading`, `priority`.
- SVG: Inline tiny SVGs; cache/sprite large icon sets.

### 13.4 Debouncing & Throttling
- Search/filter inputs must be debounced (>=300ms baseline unless justified).
- Scroll/resize/high-frequency handlers must be throttled.

### 13.5 State Management
- Localize state close to usage by default.
- Use global store only for cross-cutting/high-frequency shared state.

---

## 14. ADAPTIVE SYSTEM ARCHITECTURE (A2Z Production-Grade Standards)

### 14.1 Universal Excellence Rule
- Every project must be engineered for production-grade excellence across speed, security, scalability, reliability, and maintainability.
- Optimizations must follow stack-native best practices.

### 14.2 Core Excellence Pillars (A to Z)
1. **Performance & Speed:** Low-latency UX, efficient bundles, optimized render and data paths.
2. **Security & Defense:** Defense-in-depth, strict authorization, sanitization, vulnerability checks.
3. **Scalability & Resilience:** Decoupled modules, indexed data paths, graceful degradation.
4. **Observability & Reliability:** Structured logs, monitoring, error tracking, health checks.
5. **Maintainability & DX:** Clean architecture, documentation, CI/CD discipline.
6. **Data Integrity:** Strict schema contracts, transactional safety, backup and lifecycle planning.
7. **UX Excellence:** Core Web Vitals, accessibility, quality interactions.

---

**Signed & Enforced by:** Harun Shaikh  
**Effective Date:** Immediate
