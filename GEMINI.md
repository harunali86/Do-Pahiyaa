# DO PAHIYAA - PROJECT SPECIFIC RULES (GEMINI.md)

> **STATUS:** PROJECT-LEVEL OVERRIDE
> **APPLICABILITY:** ONLY DO PAHIYAA (SaaS Platform)
> **NOTE:** These rules run *in addition to* the global `~/.gemini/GEMINI.md` constitution.

---

## 1. SAAS EXECUTION PLAN
- **Rule:** Do Pahiyaa uses the full SaaS execution plan.
- **Enforcement:** All architecture and component decisions must align with the `FINAL_SAAS_EXECUTION_PLAN.md` acting as the master PRD for this project.

## 2. STRICT AUTHENTICATION
- **Rule:** Never bypass authentication on `/api/leads/unlock` route.
- **Enforcement:** The Lead Unlock flow is part of the core ₹49 C2C Monetization Engine. It must strictly verify the dealer's authenticated session, KYC profile, and active credit balance via secure backend authorization before any RPC execution or transactional updates.

## 3. APP SPECIFIC CONFIGS
- **Monetization Engine:** Follow the dynamic pricing and credit deduction rules strictly for lead allocation. Never update dealer credits directly on the client side.
- **Webhook Safety:** External webhooks (Razorpay, WhatsApp/Meta) must process updates transactionally using RPCs in Supabase to ensure atomicity and idempotency.
- **High-Volume Purchasing (Exception to Global Rule 5.1):** Dealer purchases (like lead unlock) are core revenue streams. Instead of the strict 5 req/min limit, allow high-volume throughput (e.g., 60 req/min) to prevent blocking active business, but ensure transactional locking guarantees are maintained.

---

## 4. ROOT CAUSE RESOLUTION (ENFORCED)
- **Rule (Reference Global 1.8):** No Temporary Patches.
- **Enforcement:** Every bug or issue in Do Pahiyaa must be fixed at its root cause. Applying "band-aid" patches or temporary workarounds is strictly forbidden. Explanations of the root cause are mandatory when submitting a fix.

## 5. DO PAHIYAA DEPLOYMENT PIPELINE
- **Rule (Reference Global 8.8):** Direct pushes to Vercel/Production are banned.
- **The Required Workflow:**
  1. **Pre-Commit Validation (Local):** Before any code is committed, Developers and Agents MUST run local verifications (`tsc`, `lint`) and complete **Playwright E2E tests** to ensure core user journeys are unbroken.
  2. **Code Review & GitHub MCP (Trigger):** Agents MUST utilize the **GitHub MCP** to create feature branches, commit the locally verified code, and raise a Pull Request.
  3. **Automated CI Gates:** The PR creation MUST trigger automated CI pipelines (e.g., GitHub Actions) to run a secondary execution of all tests (Playwright, Lint, Type-checks, Security). Merging is strictly blocked until CI passes.
  4. **CD Deployment & Vercel MCP:** Post-merge, agents MUST utilize the **Vercel MCP** (or automated pipeline integrations) to manage deployments, verify Preview environment stability, and officially promote code to the Production environment.
