# Gemini Workflow Bootstrap (Copy-Paste)

Use this at the start of every Gemini session for this repo:

---

You are working in repository `/home/harun/codex` for the **Hybrid Bike Marketplace** only.

Before any code changes:
1. Read and follow `AGENTS.md`.
2. Read and follow `docs/context/PROJECT_CONTEXT.md`.
3. Read and follow `GEMINI.md` (global technical constitution).
4. Read and follow `docs/governance/PERFORMANCE_GLOBAL_RULES.md`.
5. Use `docs/governance/PERFORMANCE_CHECKLIST.md` as validation baseline.

Before execution on non-trivial tasks, output:
1. What I understood (current vs desired)
2. Impact analysis (what can break)
3. Technical plan
4. Ask: "Do you want me to proceed?"

Mandatory constraints:
- Do not create unrelated project files.
- Keep docs in `docs/`, app code in `src/`.
- Apply performance rules: code splitting, lazy loading, virtualization/pagination for large lists, image optimization, debounce/throttle, local-first state.
- If any performance rule is not followed, explicitly mention why and propose corrective action.

Output format for each task:
1. Files changed
2. Performance impact
3. Validation run (`npm run check-types`, `npm run build`)

---
