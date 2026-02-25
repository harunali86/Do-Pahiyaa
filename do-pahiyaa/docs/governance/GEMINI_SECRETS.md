# DO PAHIYAA SECRETS HANDOVER (SANITIZED)

> **CONFIDENTIAL FORMAT NOTE**: This repo file must never contain live secrets.

This document is a reference map for required keys and where to load them securely.

---

## 1. Supabase (Database & Auth)
- **URL**: `https://<project-ref>.supabase.co`
- **Anon Key**: `SUPABASE_ANON_KEY` (load from local secret store)
- **Service Role Key**: `SUPABASE_SERVICE_ROLE_KEY` (load from local secret store)
- **Database URL**: `postgresql://<user>:<password>@<host>:5432/postgres`

## 2. Razorpay (Payments)
- **Key ID**: `RAZORPAY_KEY_ID`
- **Key Secret**: `RAZORPAY_KEY_SECRET`
- **Webhook Secret**: `RAZORPAY_WEBHOOK_SECRET`

## 3. WhatsApp Business API (Meta)
- **Access Token**: `WHATSAPP_ACCESS_TOKEN`
- **Phone Number ID**: `WHATSAPP_PHONE_NUMBER_ID`
- **Verify Token**: `META_WEBHOOK_VERIFY_TOKEN`

## 4. GitHub (Automation)
- **User**: `harunali86`
- **Token**: `GITHUB_TOKEN` (local only, never in repo)

## 5. Secure Runtime Sources
- MCP server secrets: `/home/harun/.secrets/global_mcp_secrets.env`
- App secrets: local `.env.local` (gitignored)

---

## 6. Mandatory Security Rules
1. Never commit plaintext tokens/keys to `docs/`, `src/`, or test artifacts.
2. Any exposed key must be treated as compromised and rotated.
3. Generated test configs must use placeholders (for example `API_KEY_PLACEHOLDER`).

