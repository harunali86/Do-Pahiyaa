# Agent Rules - Persistent Workspace Contract

These rules are persistent for this repository and must be followed in every session.

## 1) Scope Lock
- This project root is `/home/harun/codex/do-pahiyaa/`.
- It is a standalone enterprise ecosystem for the **Hybrid Bike Marketplace**.
- Do not mix files with `dream-smile` or other workspace projects.

## 2) File Placement Rules
- All code resides in `src/`.
- All documentation, assets, and reports reside in `docs/`.
- All DB changes reside in `supabase/`.
- Never pollute the project root (`do-pahiyaa/`).

## 3) Working Protocol (Mandatory)
1. Confirm project context and root path.
2. Read `GEMINI.md` before technical implementation.
3. For non-trivial tasks, first provide:
   - What is understood (current vs desired)
   - Impact analysis (dependencies/contracts/data risk)
   - Step-by-step technical plan
   - Explicit proceed check
4. Implement only after alignment.
5. Run relevant validation (`check-types`, `lint`, `build`) before handoff when feasible.

## 4) Global Technical Constitution Binding
- `GEMINI.md` is the **global technical constitution** for this workspace.
- Its architecture, security, performance, scalability, observability, and QA rules are mandatory.
- Stack-specific modules apply only when that stack is used.
- Missing tech does not disable core engineering rules.

## 5) Rule Hierarchy
1.  **Global `GEMINI.md` Section 15** (Universal Ecosystem)
2.  **Workspace `AGENTS.md`** (Parent Workspace Organization)
3.  **This `AGENTS.md`** (Project-Specific Rules)
4.  Task-specific plans (e.g., `docs/plans/REFACTOR_PLAN.md`)
