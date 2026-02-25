# PROTOCOL: DATABASE PERFORMANCE & INTEGRITY (BRANCH)

> **NATURE**: Specialized System Design Rules  
> **CONTEXT**: Loaded for Database, ORM, or Persistence tasks.

---

## 4. DATABASE PERFORMANCE & INTEGRITY

### 4.1 Schema & Migration Discipline
- Never edit historical migrations; append new migrations only.
- Destructive changes require explicit backup + rollback strategy.
- Live systems must follow zero-downtime migration pattern: **Expand → Migrate → Contract**.

### 4.2 Scalability & Indexing
- Index all foreign keys and hot filter/sort columns.
- Use partial indexes for hot subsets and GIN/GIST for JSONB/search use-cases.
- Prefer sortable IDs (UUIDv7/Snowflake-style) for high-write tables.

### 4.3 Query Discipline
- N+1 queries are banned.
- Use joins/includes/batching/pre-aggregation.
- Heavy analytics should use materialized views or equivalent with refresh strategy.

### 4.4 Connection & Timeout Policy
- Production DB access must use connection pooler (PgBouncer/managed equivalent).
- Tiered timeouts: OLTP (5-10s), Background (30-60s), Locks (1-2s).

### 4.5 Transactional Integrity
- Multi-table writes must be atomic.
- Financial/inventory/credits/bidding flows require strict transactional locking strategy.

### 4.6 Data Lifecycle & Recovery
- Data retention/archival/deletion policy by classification is mandatory.
- Backups, restore drills, and declared `RPO`/`RTO` targets are mandatory.

### 4.7 Multi-Tenant Safety
- Tenant-scoped queries and tenant isolation controls are mandatory.
- RLS/tenant guards required for multi-tenant systems.
