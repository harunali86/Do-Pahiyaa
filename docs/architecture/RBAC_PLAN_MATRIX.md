# Do Pahiyaa - RBAC and Plan Enforcement Matrix

## 1. Roles

- **Buyer**: purchases bikes, creates inquiries/offers.
- **Seller**: creates and manages own listings.
- **Dealer**: plan-based B2B operations, lead unlock, inventory, analytics.
- **Admin**: full operations management.
- **Super Admin**: platform governance, admin control, critical overrides.

---

## 2. Permission Matrix

Legend: `Y = allowed`, `C = conditional`, `N = not allowed`

| Capability | Buyer | Seller | Dealer | Admin | Super Admin | Conditions |
|---|---:|---:|---:|---:|---:|---|
| View public listings | Y | Y | Y | Y | Y | Published only for public |
| Save/watch listings | Y | Y | Y | Y | Y | Own account scope |
| Create inquiry lead | Y | Y | Y | Y | Y | Per-rate-limit, duplicate guard |
| Create offer/counter-offer | Y | Y | C | Y | Y | Dealer only when plan allows B2C negotiation |
| Create listing | N | Y | C | Y | Y | Dealer listing quota by plan |
| Edit own listing | N | Y | C | Y | Y | Ownership or admin override |
| Publish listing | N | C | C | Y | Y | Seller/dealer verification + quota checks |
| Delete own listing | N | Y | C | Y | Y | Ownership checks |
| View own leads | C | Y | C | Y | Y | Buyer own created; dealer own/unlocked only |
| Unlock lead contact | N | N | C | Y | Y | Credits + monthly limit + entitlement |
| View unlocked contact details | N | N | C | Y | Y | Unlock event must exist |
| Dealer inventory dashboard | N | N | C | Y | Y | Requires dealer entitlement |
| Dealer analytics dashboard | N | N | C | Y | Y | Tier-gated by plan |
| Dealer subscription management | N | N | Y | Y | Y | Dealer self + admin control |
| Join live auction room | N | N | C | Y | Y | `auction_access=true` |
| Place auction bid | N | N | C | Y | Y | KYC + entitlement + anti-fraud checks |
| View auction bid history | N | N | C | Y | Y | Scope-controlled |
| Deal lifecycle updates | C | C | C | Y | Y | Role-specific transitions only |
| Manage users | N | N | N | Y | Y | Admin scoped |
| Manage dealers/verification | N | N | N | Y | Y | Admin scoped |
| Manage plans/pricing | N | N | N | C | Y | Admin optional, super admin final override |
| Manage feature flags | N | N | N | C | Y | Protected settings |
| Trigger platform maintenance mode | N | N | N | C | Y | High-privilege action |
| View audit logs | N | N | N | C | Y | Admin read, super admin full |
| Purge/rotate audit archives | N | N | N | N | Y | Super admin only |

---

## 3. Dealer Plan Entitlement Matrix

| Feature | Basic | Pro | Enterprise | Enforcement Point |
|---|---:|---:|---:|---|
| Active listings cap | 25 | 100 | Unlimited | Listing create/publish service |
| Monthly lead unlocks | 100 | 500 | Unlimited | Lead unlock service |
| Included credits/month | 50 | 250 | 1000 | Billing cycle credit job |
| Auction participation | N | Y | Y | Auction join/bid API guard |
| Analytics depth | Basic KPIs | Funnel + cohort | Full BI + exports | Dealer analytics controller |
| Team seats | 1 | 3 | 10 | Team invite/create user action |
| Priority support | N | N | Y | Support routing policy |
| SLA | Best effort | Standard | Priority | Ops policy layer |

---

## 4. Enforcement Architecture

## 4.1 Mandatory guard order

1. **Route guard** (middleware/proxy)
2. **API guard** (role check + auth context)
3. **Service guard** (ownership + entitlement + lifecycle)
4. **DB guard** (RLS policy)
5. **Audit event** (immutable write)

## 4.2 Rejection policy

For denied action, API must return:

- `403` for authorization failure
- `402/409` for plan/credits limits
- machine-readable error code
- user-safe message (no internal details)

---

## 5. Required Policy Checks by Domain

## 5.1 Listings

- Owner-only edit/delete
- Admin moderation override
- Dealer listing cap by plan
- Seller/dealer verification checks before publish

## 5.2 Leads

- Duplicate prevention (`listing_id + buyer_id`)
- Unlock idempotency (`dealer_id + lead_id`)
- Credits and monthly cap checks
- Contact reveal only after unlock event

## 5.3 Deals

- Strict state machine transition rules
- Role-bound transitions
- Cancellation reason mandatory
- Commission event tracked

## 5.4 Auctions

- Plan gate for dealer access
- KYC + subscription active check
- Anti-sniping auto-extend enforcement
- Bid monotonicity and minimum increment enforcement

## 5.5 Admin and Settings

- Sensitive actions require elevated role
- Optional dual-approval for destructive financial actions
- Every action logged with before/after snapshot

---

## 6. Audit Event Requirements

Every critical action writes:

- `actor_id`
- `actor_role`
- `resource_type`
- `resource_id`
- `action`
- `before_payload`
- `after_payload`
- `ip`
- `user_agent`
- `created_at`

Critical actions include:

- role changes
- dealer verification
- credit adjustments
- lead unlock
- listing moderation
- deal state override
- auction pause/cancel/settle
- settings changes

---

## 7. Dev Bypass Compatibility (Temporary)

During `AUTH_MODE=dev_bypass`:

- role context comes from dev actor flags.
- all role/plan guards still execute.
- audit logs mark `auth_mode=dev_bypass`.

In `AUTH_MODE=enforced`:

- role context comes from JWT + profile.
- any bypass path must be disabled.

---

## 8. Release Gate for RBAC

Release blocked unless:

1. All matrix capabilities mapped to API/service checks.
2. RLS tests pass for buyer/seller/dealer/admin/super admin personas.
3. Unauthorized action tests return correct status codes.
4. Audit logs exist for all critical actions.
5. Plan-limit scenarios are fully covered in tests.
