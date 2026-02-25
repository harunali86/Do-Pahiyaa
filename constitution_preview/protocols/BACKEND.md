# PROTOCOL: BACKEND & API DESIGN (BRANCH)

> **NATURE**: Specialized System Design Rules  
> **CONTEXT**: Loaded for API development, Server logic, or Async workflows.

---

## 3. API DESIGN, VERSIONING & LIFECYCLE

### 3.1 Response Contract
- Standard envelope required for external APIs:
  - `{ success: boolean, data?: T, error?: { code: string, message: string } }`

### 3.2 API Versioning
- Public APIs must be versioned (`/api/v1` minimum).
- Breaking changes require new version (`/api/v2`, `/api/v3`).

### 3.3 Compatibility Policy
- Breaking contract changes require deprecation window + migration guide.

### 3.4 API Security
- Strict schema validation and unknown-field stripping.
- Rate limits by endpoint sensitivity.

---

## 8. ASYNC & BACKGROUND JOBS
- **Queue System**: Tasks expected to exceed 2s go to background jobs (emails, reports, broadcast).
- **Resilience**: Retries + dead-letter handling.

---

## 2.1 Clean Architecture (A2Z Standards)
- **Controllers**: Routing, DTO Validation, HTTP status only.
- **Services**: 100% business logic. Unit-testable.
- **Repositories**: Data abstraction and query concerns.
- **Third-Party**: Never call vendor SDKs (Stripe, OpenAI) directly in controllers; use Adapters.
