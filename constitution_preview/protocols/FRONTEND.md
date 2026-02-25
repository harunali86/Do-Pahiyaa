# PROTOCOL: FRONTEND PERFORMANCE & UX EXCELLENCE (BRANCH)

> **NATURE**: Specialized System Design Rules  
> **CONTEXT**: Loaded for Frontend, UI/UX, or Client-side performance tasks.

---

## 7. PERFORMANCE & SCALABILITY (FRONTEND)

### 7.2 Frontend Performance Budgets
- **Core Web Vitals** thresholds (P75 production):
  - LCP < 2.5s
  - CLS < 0.1
  - INP < 200ms
- Route-class JS bundle budgets enforced in CI.

### 7.3 Rendering & Data Efficiency
- Use dynamic imports for heavy client modules.
- **Virtualization**: Large lists/tables (>50 rows) MUST use virtualization or strict server pagination.
- Debounce search/filter (>=300ms) and throttle high-frequency handlers.

### 7.4 Caching Strategy
- Multi-layer caching policy (edge/app/data layer) with explicit invalidation.

---

## 13. FRONTEND PERFORMANCE PROTOCOL (A2Z Standards)

### 13.1 Code Splitting & Lazy Loading
- Mandatory: Use dynamic imports for heavy client modules (charts/modals/complex tables).
- Priority: Only above-the-fold content loads initially.

### 13.2 List Virtualization
- Rule: Avoid DOM bloat and hydration lag by virtualizing long lists.

### 13.3 Asset & Image Optimization
- Rule: Use optimized image delivery (`next/image` or equivalent) with proper `sizes`, `loading`, `priority`.
- SVG: Inline tiny SVGs; cache/sprite large icon sets.

### 13.4 Debouncing & Throttling
- Search/filter inputs must be debounced (>=300ms baseline).

### 13.5 State Management
- Localize state close to usage by default.
- Use global store only for cross-cutting/high-frequency shared state.
