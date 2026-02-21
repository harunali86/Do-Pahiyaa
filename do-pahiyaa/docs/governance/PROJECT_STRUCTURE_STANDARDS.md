# Project Structure Standards - Hybrid Bike Marketplace

> **STRICT ENFORCEMENT**: This project is for the **Hybrid Bike Marketplace** (Next.js) ONLY.
> **DO NOT** add files for other projects (e.g., VPN, Android apps) here.

## 1. Allowed Directory Layout

```text
/home/harun/codex/
├── docs/                     # Project documentation ONLY
│   ├── GEMINI_HANDOFF.md     # Master handoff doc
│   ├── ARCHITECTURE.md       # Technical architecture
│   └── ...
├── src/                      # Source code
│   ├── app/                  # Next.js App Router (Pages/Routes)
│   ├── components/           # React Components
│   │   ├── ui/               # Generic UI (Buttons, Inputs)
│   │   ├── features/         # Domain-specific (AuctionCard)
│   │   └── layout/           # Navbar, Footer
│   ├── lib/                  # Utilities, Supabase Clients
│   └── types/                # TypeScript Interfaces
├── public/                   # Static assets (images, fonts)
└── [config files]            # next.config.ts, package.json, etc.
```

## 2. Rules for Agents (Codex/Gemini)

1.  **Context Check**: Before creating a file, verify you are in `/home/harun/codex`.
2.  **No Pollution**: If asked to build a different app, **STOP** and ask for a new directory.
3.  **Docs First**: All architectural decisions must go into `docs/` first.
4.  **Strict Separation**: Do not mix `backend` code (unless Next.js API routes) with frontend UI logic.

## 3. Persistence (Not Chat-Limited)

To keep this behavior consistent across future sessions:

1.  Keep `AGENTS.md` at repo root and treat it as mandatory contract.
2.  For every new project, first create a separate root folder.
3.  Copy `templates/AGENTS_TEMPLATE.md` into that new project as `AGENTS.md`.
4.  Only then create `docs/`, `src/`, `assets/`, `scripts/`, and project files.

This prevents random file creation and cross-project mixing.
