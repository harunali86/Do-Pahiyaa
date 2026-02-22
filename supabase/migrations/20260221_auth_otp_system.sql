-- OTP Requests Table for WhatsApp/SMS Auth
CREATE TABLE IF NOT EXISTS public.auth_otp_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 5,
    consumed_at TIMESTAMPTZ,
    channel TEXT DEFAULT 'whatsapp', -- 'whatsapp' | 'sms' | 'mock'
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup and cleanup
CREATE INDEX IF NOT EXISTS idx_auth_otp_phone ON public.auth_otp_requests (phone) WHERE (consumed_at IS NULL);
CREATE INDEX IF NOT EXISTS idx_auth_otp_expires ON public.auth_otp_requests (expires_at);

-- Auth Audit Log Table
CREATE TABLE IF NOT EXISTS public.auth_login_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    phone TEXT,
    action TEXT NOT NULL, -- 'login_attempt', 'otp_sent', 'login_success', 'login_failed'
    ip_address TEXT,
    user_agent TEXT,
    status TEXT, -- 'success', 'failure'
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies (Locked down to service role / internal only)
ALTER TABLE public.auth_otp_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_login_audit ENABLE ROW LEVEL SECURITY;

-- Note: These tables are strictly for backend service logic.
-- Frontend will interact via protected API routes.
