-- Audit logs RBAC patch: allow both admin and super_admin to read.

CREATE OR REPLACE FUNCTION public.is_admin_or_superadmin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = p_user_id
      AND role::text IN ('admin', 'super_admin')
  );
$$;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin View Audit Logs" ON public.audit_logs;

CREATE POLICY "Admin and Super Admin View Audit Logs"
ON public.audit_logs
FOR SELECT
USING (public.is_admin_or_superadmin(auth.uid()));
