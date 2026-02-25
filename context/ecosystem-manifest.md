# AI Ecosystem Manifest: 2026 Production Standards

This document is the source of truth for AI agents (Codex, Antigravity) to understand and utilize the current technical ecosystem.

## 🧠 1. Context Memory System
The repo uses a mandatory memory layer to prevent hallucinations.
- **Location**: `/context/` at repo root.
- **Protocol**: Agents MUST read following files before execution:
  - `architecture.md`: System design and data flow.
  - `decisions.md`: Architectural decisions and "Why".
  - `current-state.md`: Active tasks and immediate focus.

## 🎭 2. Active MCP Tools (Secure Wrapper Protocol)
The ecosystem uses a **Zero-Plaintext** architecture via binary wrappers.
- **Config Hub**: `/home/harun/global_mcp_config.json` (Contains NO keys).
- **Secret Vault**: `/home/harun/.secrets/global_mcp_secrets.env` (Owner-only access).
- **Execution**: Tools are launched via wrappers in `~/.local/bin/` (e.g., `mcp-supabase`) which inject secrets at runtime.
- **Protocol**: Never put raw tokens in JSON. Always update the **Secret Vault** and use the **Config Hub** for tool definitions.

### Available Tools:
- **GitHub**: Manage issues, PRs, and branch history.
- **Supabase**: Direct DB control, RLS audits, and migrations.
- **Sentry**: Triage production errors and performance bottlenecks.
- **Playwright**: Browser automation and UI regression testing.
- **Testsprite**: Autonomous AI testing for complex user flows.
- **Vercel**: Deployment status and log analysis (configured via CLI/MCP).

## 🛡️ 3. Cybersecurity & Quality Scanners
Automated security loops are configured in `.github/workflows/`:
- **CodeQL**: Deep static analysis for vulnerabilities.
- **Semgrep**: Business logic security and auth flow audits.
- **TruffleHog**: Real-time secret scanning (Prevents credential leaks).
- **Nightly Audit**: Scheduled dependency security and repo health checks.

## ✍️ 4. Documentation Protocol
- **`doc-sync` skill**: Use `antigravity sync-docs` to auto-maintain `/context` and `GEMINI.md`.
- **`GEMINI.md`**: The supreme law defining clean architecture and security gates.

## 🚀 5. Deployment & CI/CD
- **Strategy**: Expanded zero-downtime migrations (Expand -> Migrate -> Contract).
- **Gate**: PRs are blocked if CodeQL or Semgrep scans fail.
