# Agent Rules - Persistent Workspace Contract

These rules are persistent for this repository and must be followed in every session.

## Scope Lock
- This repo (`/home/harun/codex`) is only for the **Hybrid Bike Marketplace** project.
- Do not create files for other products (Android VPN, unrelated apps, experiments).
- If user asks for a different project, stop and ask for a separate root directory first.

## File Placement Rules
- Before creating any file, validate the target path belongs to this project.
- Keep docs in `docs/`, app code in `src/`, infra in existing config files/directories.
- Do not drop random planning files at repo root.

## New Project Rule (Mandatory)
- For any new project, create a dedicated folder first, then create files inside that folder.
- Recommended first structure:
  - `docs/`
  - `src/`
  - `assets/`
  - `scripts/`
  - `README.md`
  - `AGENTS.md`

## Working Protocol
1. Confirm project context and root path.
2. Create/verify folder structure.
3. Add docs first (plan/architecture), then implementation files.
4. Keep cross-project separation strict.
