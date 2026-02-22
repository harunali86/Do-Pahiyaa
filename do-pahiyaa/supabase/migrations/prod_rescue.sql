-- PRODUCTION RESCUE SCRIPT
-- 1) Create Missing OTP Tables
CREATE TABLE IF NOT EXISTS public.auth_otp_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 5,
    consumed_at TIMESTAMPTZ,
    channel TEXT DEFAULT 'whatsapp',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.auth_login_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    phone TEXT,
    action TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    status TEXT,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2) Create Storage Bucket for Photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('listings', 'listings', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 3) Storage RLS Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Uploads" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'listings');
CREATE POLICY "Auth Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listings' AND auth.role() = 'authenticated');

-- 4) Security Hardening
ALTER TABLE public.auth_otp_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_login_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER FUNCTION public.is_admin_or_superadmin(UUID) SET search_path = public;
ALTER FUNCTION public.auto_promote_admin() SET search_path = public;

-- 5) Sync Cache
NOTIFY pgrst, 'reload schema';
