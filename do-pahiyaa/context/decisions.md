# Decisions: Do-Pahiyaa

## ADR 1: Clean Architecture
- **Decision**: No direct Supabase calls in UI. Use Service/Repository layers.
- **Why**: Scalability and unit testing readiness.

## ADR 2: WhatsApp OTP
- **Decision**: WhatsApp as primary auth channel.
- **Why**: Higher engagement in Indian market.

## ADR 3: Fixed Pricing (v1)
- **Decision**: ₹49 flat rate for leads.
- **Why**: Simplify onboarding and conversion tracking.
