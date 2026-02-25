# Known Issues: Do-Pahiyaa

Last updated: 2026-02-24

## Security
- Historical plaintext secrets were found in governance/test artifacts and have been redacted; rotation status must be tracked by ops owner.

## API / Contract
- PRD defines a larger API surface than currently implemented in `src/app/api/v1`.
- Some behavior exists in server actions but not yet as external API contracts.

## Schema / Plan Engine
- `dealer_subscriptions` exists, but PRD plan-engine tables like `dealer_plans`, `credits_ledger`, `dealer_entitlements_snapshot`, `usage_counters_monthly`, and `billing_adjustments` are still pending.

## Auth / Session
- OTP flow currently returns a server-created session that is set on client-side; this needs a hardened final pattern review.

## Reliability / Ops
- SLO/SLI/error-budget/DR-chaos evidence is not yet codified as operational artifacts.
- `gh` and `vercel` CLI runtime authentication is not guaranteed on every machine.

## Technical Debt
- `v2` vs `v3` RPC references still appear in legacy scripts and comments.
- Lint warnings remain (image optimization + hook dependency warnings).

