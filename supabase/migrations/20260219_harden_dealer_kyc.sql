-- Hardening Profiles for Dealer KYC Workflow

-- 1. Add status and is_verified to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('pending_verification', 'active', 'blocked')),
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- 2. Update existing dealers to pending if they haven't been verified
-- (This is a safety measure for existing data)
UPDATE public.profiles 
SET status = 'pending_verification' 
WHERE role = 'dealer' AND is_verified = FALSE;

-- 3. Ensure KYC documents has a status and reason
ALTER TABLE public.kyc_documents
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 4. Function to update profile verification status when KYC is approved
CREATE OR REPLACE FUNCTION public.check_dealer_verification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'verified' THEN
        -- Check if all 3 mandatory docs are verified for this user
        -- (This logic can be expanded based on exact requirements)
        IF (
            SELECT COUNT(*) 
            FROM public.kyc_documents 
            WHERE user_id = NEW.user_id AND status = 'verified'
        ) >= 3 THEN
            UPDATE public.profiles 
            SET is_verified = TRUE, status = 'active'
            WHERE id = NEW.user_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger for automated verification (optional, can also be done via Admin Service)
DROP TRIGGER IF EXISTS trg_check_dealer_verification ON public.kyc_documents;
CREATE TRIGGER trg_check_dealer_verification
AFTER UPDATE ON public.kyc_documents
FOR EACH ROW
EXECUTE FUNCTION public.check_dealer_verification();
