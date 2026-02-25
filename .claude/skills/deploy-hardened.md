# Deploy Hardened Skill

> **STATUS**: INTERNAL SKILL  
> **ENGINE**: Claude Code CLI / Antigravity

This skill automates the deployment of 'Hardened' code to production environments, ensuring all Tier-0 standards from `GEMINI.md` are met.

## Execution Workflow

1. **Pre-flight Hardening**:
   - Run `check-types` and `lint`.
   - Verify all `TODO` items in the current task are resolved.
2. **Security Audit**:
   - Scan for plaintext PII or secrets.
   - Verify RLS policies against current schema.
3. **Performance Gate**:
   - Run production build: `npm run build`.
   - Verify JS bundle sizes against budget.
4. **Deploy & Verify**:
   - Deploy to Vercel/Production: `vercel --prod`.
   - Run Playwright E2E smoke tests: `npx playwright test`.
5. **Post-Deployment Health**:
   - Check API latency P95 <= 300ms.
   - Log deployment success to `#dev-ops`.

## Commands
- `/deploy-hardened`: Triggers the full autonomous deployment pipeline.
