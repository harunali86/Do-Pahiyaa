# Global Ecosystem Architecture: 2026

## Overview
This document defines the shared technical infrastructure across all workspace projects (Do-Pahiyaa, Cab, Medical, etc.).

## Shared Tech Stack
- **Auth**: Supabase Auth (Unified Session Management)
- **Database**: PostgreSQL (Multi-tenant via RLS)
- **Storage**: Supabase Storage (Signed URL Protocol)
- **CI/CD**: GitHub Actions + Vercel Deployment Gates

## Tools & MCPs
- **Supabase MCP**: Database & RLS Control
- **GitHub MCP**: SCM & Issue Management
- **Vercel MCP**: Infrastructure & Logs

## Universal Standards
- All projects follow the **Unified Modular Constitution (GEMINI.md)**.
- Mandatory **Context Memory layer** at `/context/` for every project.

## Multi-Client Architecture Strategy (Future-Proofing)
While Web applications (like Do-Pahiyaa) utilize **Next.js Server Actions** for maximized UI delivery speed, the core architectures must natively support **future Android & iOS mobile applications** without requiring massive API rewrites. 

To achieve this without prematurely building and maintaining a custom REST API layer in Next.js today, all business logic and security must be pushed to the database layer:
1. **Row Level Security (RLS)** in PostgreSQL guarantees authorization regardless of the client (Web vs Mobile).
2. **Supabase Database Functions (RPCs)** handle complex atomic transactions.
3. Future Mobile Apps will query the database directly using **Supabase native SDKs** and **pg_graphql**. This ensures that the architecture is 100% mobile-ready *now*, while eliminating the immediate overhead of building redundant REST APIs.
