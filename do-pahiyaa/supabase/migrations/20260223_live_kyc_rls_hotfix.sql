-- Live P0 hotfix: restore missing KYC table and enforce explicit listing insert policy
-- Safe to re-run (idempotent)

BEGIN;

CREATE TABLE IF NOT EXISTS public.kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT kyc_documents_status_check CHECK (status IN ('pending', 'verified', 'rejected'))
);

ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view/upload own KYC" ON public.kyc_documents;
CREATE POLICY "Users can view/upload own KYC"
ON public.kyc_documents
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can review all KYC documents" ON public.kyc_documents;
CREATE POLICY "Admins can review all KYC documents"
ON public.kyc_documents
FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role::TEXT IN ('admin', 'super_admin', 'super-admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.role::TEXT IN ('admin', 'super_admin', 'super-admin')
    )
);

CREATE INDEX IF NOT EXISTS idx_kyc_documents_user_id ON public.kyc_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_status ON public.kyc_documents(status);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_created_at ON public.kyc_documents(created_at DESC);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can create listings" ON public.listings;
CREATE POLICY "Authenticated users can create listings"
ON public.listings
FOR INSERT
WITH CHECK (auth.uid() = seller_id);

COMMIT;
