# Known Issues & Technical Debt Tracker
> **Status**: Active  
> **Rule Applicability**: Supreme Core §15.1 (Context Memory Protocol)

This document tracks accepted operational gotchas, architectural compromises, and technical debt. It must be reviewed before beginning new architectural features.

### 1. API Architecture vs PRD Contract (Mobile App Readiness)
- **Issue**: The original project PRD specified a comprehensive suite of raw REST API endpoints (`/api/v1/admin/*`, `/api/v1/dealer/*`, etc.).
- **Current State**: The Web app is built using modern Next.js 14+ **Server Actions** directly bound to React Components. The explicit REST layer has been intentionally skipped.
- **Resolution Path (Android/iOS Apps)**: Since mobile apps are planned for the future, Server Actions will not suffice. However, instead of manually building and maintaining a vast REST API layer, we will leverage **Supabase's built-in GraphQL (`pg_graphql`)** and native client SDKs. This provides a secure, RLS-enforced, and network-efficient API for mobile clients out-of-the-box, making the massive raw REST API implementation redundant.

### 2. Authentication Session Storage
- **Issue**: The platform currently utilizes `supabase.auth.setSession(...)` which stores JWT tokens in the browser's local storage.
- **Current State**: While functioning correctly for seamless UX, this technically conflicts with the strictest interpretation of the "Zero-Plaintext" security policy. 
- **Accepted Risk**: To enforce strict security without breaking the current UI architecture, we rely on the implementation of HttpOnly Session cookies via the `middleware.ts` layer, accepting the local storage persistence as a necessary UI compromise.

### 3. Historical Secrets Exposure
- **Issue**: During the initial development and MCP testing phases, plaintext secrets (like `GEMINI_SECRETS.md` and TestSprite configs) were accidentally tracked in the repository.
- **Current State**: All tracked secret files have been flagged for deletion. The environment strictly mandates using `dopahiyaa.env` via `.gitignore` and secure vault injections.
- **Mitigation**: Any exposed keys in those historical files must be rotated immediately before a public Go-Live event.
