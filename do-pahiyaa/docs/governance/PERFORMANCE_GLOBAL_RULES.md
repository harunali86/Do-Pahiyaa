# Performance Global Rules (Mandatory)

This file defines mandatory performance engineering standards for this repository.

## 1) Bundle & Code Splitting

- Use route-level splitting by default (App Router).
- Use `next/dynamic` for heavy components:
  - Charts
  - Rich editors
  - Large admin/dealer tables
  - Non-critical widgets
- Keep public landing and listing routes lightweight.

## 2) Lazy Loading

- Defer non-critical UI:
  - secondary tabs
  - modals/drawers
  - analytics panels
- Add loading/skeleton states for deferred components.

## 3) Lists & Tables

- If a list can exceed ~100 rows, use at least one:
  - server-side pagination
  - virtualization (`@tanstack/react-virtual` / equivalent)
- Avoid rendering large arrays directly without paging/virtualization.

## 4) Images & Media

- Use `next/image` with:
  - explicit `sizes`
  - tuned `quality`
  - placeholder strategy
- LCP image: `priority` only where justified.
- Non-LCP images: lazy by default.
- Avoid global `images.unoptimized = true` unless there is a temporary operational constraint.

## 5) Event & Input Control

- Debounce/throttle required for:
  - search inputs
  - filter text
  - realtime/high-frequency client events
- Do not fire network requests on every keystroke.

## 6) State Locality & Rendering

- Keep state local-first.
- Lift state only when shared coordination is required.
- Memoize expensive derived values and stable callbacks when needed.

## 7) Data Fetch & Query Rules

- Use lean select lists (no overfetch).
- Avoid N+1 query patterns.
- Apply pagination for list APIs.
- Use cache/revalidate strategy intentionally (not accidentally).

## 8) Performance Validation Gate

Before marking performance work complete:

1. `npm run build` passes.
2. `npm run check-types` passes.
3. Lighthouse quick audit on critical pages (`/`, `/search`, dealer/admin heavy routes).
4. Confirm:
   - LCP target ≤ 2.5s (mobile profile)
   - CLS ≤ 0.1
   - INP ≤ 200ms (target)

## 9) Exception Policy

Any rule exception must be documented in the related task notes with:
- reason
- impact
- rollback/improvement plan
