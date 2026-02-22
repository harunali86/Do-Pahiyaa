-- RPC for Atomic Subscription Purchase
-- Ensures credits are deducted AND subscription is created in one transaction.

CREATE OR REPLACE FUNCTION public.purchase_subscription(
    p_dealer_id UUID,
    p_filters JSONB,
    p_quota INTEGER,
    p_cost_credits INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_balance INTEGER;
    v_subscription_id UUID;
BEGIN
    -- 1. Check Balance
    SELECT credits_balance INTO v_current_balance
    FROM public.dealers
    WHERE profile_id = p_dealer_id
    FOR UPDATE; -- Lock the row

    IF v_current_balance IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Dealer not found');
    END IF;

    IF v_current_balance < p_cost_credits THEN
        RETURN jsonb_build_object('success', false, 'message', 'Insufficient credits');
    END IF;

    -- 2. Deduct Credits
    UPDATE public.dealers
    SET credits_balance = credits_balance - p_cost_credits
    WHERE profile_id = p_dealer_id;

    -- 3. Create Subscription
    INSERT INTO public.dealer_subscriptions (
        dealer_id,
        filters,
        total_quota,
        remaining_quota,
        price_paid_credits,
        status
    ) VALUES (
        p_dealer_id,
        p_filters,
        p_quota,
        p_quota,
        p_cost_credits,
        'active'
    ) RETURNING id INTO v_subscription_id;

    -- 4. Log Transaction (Optional but good for audit)
    -- We reusing 'transactions' table but it refers to MONEY usually. 
    -- For credit usage, we usually define a 'credit_ledger' or similar. 
    -- For now, we trust the 'price_paid_credits' in subscription as record.
    
    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Subscription activated',
        'subscription_id', v_subscription_id,
        'new_balance', v_current_balance - p_cost_credits
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;
