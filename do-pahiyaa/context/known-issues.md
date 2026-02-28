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

## IDE / Platform Bugs (Urgent)
- **Antigravity UI Bug (v1.19.6)**: "Past Conversations" clock icon shows `🚫` (Blocked). UI handshake with history service is unstable.
- **Agent Approval Drawer Invisible**: Approval buttons for `notify_user` and `task_boundary` are often missing even when status shows "User input required". 
  - *Workaround*: Bypass Task Mode (Task View) or use direct chat if agent seems stuck.
- **WABA Billing Blocker**: WhatsApp OTP delivery fails silently despite "Accepted" status if payment profile is not linked to the specific WABA account in Meta Business Suite.

