-- Phase 17: Audit Logs Table
-- Tracks critical system changes for "India Industry Grade" observability.

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_id UUID REFERENCES public.profiles(id), -- Who did it
    action TEXT NOT NULL, -- e.g., 'CREATE_PRICING_RULE', 'UPDATE_QUOTA', 'OVERRIDE_PRICE'
    entity_id TEXT, -- ID of the affected resource
    entity_type TEXT, -- 'pricing_rule', 'dealer_subscription', 'lead'
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: Admin Only
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin View Audit Logs" ON public.audit_logs 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE INDEX idx_audit_actor ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_action ON public.audit_logs(action);
CREATE INDEX idx_audit_created ON public.audit_logs(created_at DESC);
