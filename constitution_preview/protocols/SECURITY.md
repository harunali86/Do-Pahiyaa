# PROTOCOL: SECURITY, PRIVACY & COMPLIANCE (BRANCH)

> **NATURE**: Specialized System Design Rules  
> **CONTEXT**: Loaded for Auth, PII, Encryption, or Compliance tasks.

---

## 5. SECURITY, PRIVACY & COMPLIANCE

### 5.1 Authentication & Session
- Secure HttpOnly cookies for web sessions in production.
- Sensitive auth tokens in localStorage are forbidden.
- Admin and privileged operations require stronger auth controls (MFA/step-up).

### 5.2 Authorization
- Enforce RBAC at route + service + DB policy layers.
- Sensitive actions require explicit permission checks and audit logging.

### 5.3 Secrets & Key Management
- No secrets in code or committed env files.
- Production secrets must use managed secret store.
- Cryptographic keys must be managed in KMS/HSM/Vault with owner + rotation SLA.

### 5.4 Input/Output Safety
- Parameterized queries only (SQL injection prevention).
- XSS-safe rendering with strict CSP policy.
- CSRF protection for cookie-based auth write routes.

### 5.5 Headers & CORS
- Mandatory production headers: `CSP`, `HSTS`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- Strict CORS allowlist only; wildcard origins forbidden in production.

---

## 6. AUTH & DATA PRIVACY (Specific Rules)
- **Logging**: Never log plaintext PII (email/phone/password/token).
- **Masking**: Mask sensitive fields in logs and diagnostics.
- **File Security**: MIME allowlist + file size limits + Signed URLs.
