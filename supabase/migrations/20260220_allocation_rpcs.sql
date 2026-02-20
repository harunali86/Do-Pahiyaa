-- RPC for Atomic Lead Allocation
-- This ensures that when a lead is matched, the allocation and quota decrement happen atomically.

CREATE OR REPLACE FUNCTION public.allocate_lead_to_sub(
    p_lead_id UUID,
    p_subscription_id UUID,
    p_dealer_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_remaining INTEGER;
BEGIN
    -- 1. Check if already allocated to this dealer (Idempotency)
    IF EXISTS (SELECT 1 FROM public.lead_allocations WHERE lead_id = p_lead_id AND dealer_id = p_dealer_id) THEN
        RETURN FALSE;
    END IF;

    -- 2. Lock the subscription and check quota
    SELECT remaining_quota INTO v_remaining
    FROM public.dealer_subscriptions
    WHERE id = p_subscription_id AND status = 'active'
    FOR UPDATE;

    IF v_remaining IS NULL OR v_remaining <= 0 THEN
        RETURN FALSE;
    END IF;

    -- 3. Create Unlock Event (Cost is 0 because pre-paid)
    INSERT INTO public.unlock_events (lead_id, dealer_id, cost_credits)
    VALUES (p_lead_id, p_dealer_id, 0);

    -- 4. Record Allocation
    INSERT INTO public.lead_allocations (lead_id, subscription_id, dealer_id)
    VALUES (p_lead_id, p_subscription_id, p_dealer_id);

    -- 5. Decrement Quota
    UPDATE public.dealer_subscriptions
    SET remaining_quota = remaining_quota - 1,
        status = CASE WHEN remaining_quota - 1 <= 0 THEN 'exhausted' ELSE 'active' END
    WHERE id = p_subscription_id;

    RETURN TRUE;

EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;
