# GEMINI Implementation Workflow (Main Rules + Branches)

## Objective
Apply `GEMINI.md` with **zero wording changes** to rules, using a strict execution workflow.

## Rule Integrity Constraint
- `GEMINI.md` rule text is immutable in this workflow pass.
- Only execution order/selection logic is defined here.

## Step 1: Load Main Rules (Always)
Always apply Volume I first:
- Scope and Applicability
- Governance Protocol
- Standalone Ecosystem Rules
- Deployment Tiers
- Context Memory Protocol
- Enforcement

## Step 2: Select Readiness Tier
Pick one tier before implementation:
- Tier-0: full enforcement
- Tier-1: production enforcement with justified exceptions
- Tier-2: core-only + speed-focused execution

## Step 3: Branch Selection (Task-Driven)
Load only relevant Volume II branches:
- Backend/API task -> Backend & API branch
- Database/migration/query task -> Database branch
- Auth/privacy/compliance task -> Security branch
- UI/performance/client task -> Performance & Quality branch
- CI/CD/SRE/release/cost task -> Operations & Reliability branch

## Step 4: Multi-Branch Cases
If task spans domains, combine required branches only.
Example:
- Payment API + ledger migration -> Backend + Security + Database + Operations

## Step 5: Execution Lock Before Work
Before any implementation:
1. current vs desired
2. impact analysis
3. step-by-step plan
4. explicit proceed checkpoint

## Step 6: Definition of Done Validation
Before completion claim:
- required checks pass
- CLI verification for release candidates
- no policy bypass

## Step 7: Evidence Logging
For every substantial task, capture:
- selected tier
- selected branches
- waiver (if any) with owner + expiry

