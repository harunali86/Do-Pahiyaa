-- Migration: Integrate Financial Ledgers into Core RPCs
-- Requirement: Global Rules §4.5 (Transactional Integrity)

-- 1) Update purchase_subscription_v3 to record in credits_ledger
CREATE OR REPLACE FUNCTION public.purchase_subscription_v3(
    p_filters JSONB DEFAULT '{}'::jsonb,
    p_quota INTEGER DEFAULT 1,
    p_expected_total INTEGER DEFAULT NULL,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_filters JSONB := COALESCE(jsonb_strip_nulls(p_filters), '{}'::jsonb);
    v_price JSONB;
    v_total INTEGER;
    v_balance INTEGER;
    v_subscription_id UUID;
    v_response JSONB;
    v_existing JSONB;
    v_key TEXT := COALESCE(NULLIF(trim(p_idempotency_key), ''), encode(gen_random_bytes(12), 'hex'));
    v_dealer_internal_id UUID;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'code', 'UNAUTHORIZED',
            'message', 'Authentication required'
        );
    END IF;

    SELECT response_payload INTO v_existing
    FROM public.purchase_requests
    WHERE dealer_id = v_user_id
        AND idempotency_key = v_key
    LIMIT 1;

    IF v_existing IS NOT NULL THEN
        RETURN v_existing;
    END IF;

    INSERT INTO public.purchase_requests (dealer_id, idempotency_key, request_payload)
    VALUES (
        v_user_id,
        v_key,
        jsonb_build_object(
            'filters', v_filters,
            'quota', p_quota,
            'expected_total', p_expected_total
        )
    )
    ON CONFLICT (dealer_id, idempotency_key) DO NOTHING;

    v_price := public.calculate_subscription_price_v3(v_filters, p_quota);

    IF COALESCE((v_price->>'success')::BOOLEAN, FALSE) = FALSE THEN
        v_response := v_price;
        UPDATE public.purchase_requests
        SET response_payload = v_response
        WHERE dealer_id = v_user_id
            AND idempotency_key = v_key;
        RETURN v_response;
    END IF;

    v_total := COALESCE((v_price->>'totalPrice')::INTEGER, 0);

    IF p_expected_total IS NOT NULL AND p_expected_total <> v_total THEN
        v_response := jsonb_build_object(
            'success', FALSE,
            'code', 'PRICE_MISMATCH',
            'message', format('Expected %s but current price is %s', p_expected_total, v_total),
            'currentPrice', v_total
        );

        UPDATE public.purchase_requests
        SET response_payload = v_response
        WHERE dealer_id = v_user_id
            AND idempotency_key = v_key;

        RETURN v_response;
    END IF;

    SELECT profile_id, credits_balance INTO v_dealer_internal_id, v_balance
    FROM public.dealers
    WHERE profile_id = v_user_id
    FOR UPDATE;

    IF v_dealer_internal_id IS NULL THEN
        v_response := jsonb_build_object(
            'success', FALSE,
            'code', 'DEALER_NOT_FOUND',
            'message', 'Dealer profile not found'
        );

        UPDATE public.purchase_requests
        SET response_payload = v_response
        WHERE dealer_id = v_user_id
            AND idempotency_key = v_key;

        RETURN v_response;
    END IF;

    IF v_balance < v_total THEN
        v_response := jsonb_build_object(
            'success', FALSE,
            'code', 'INSUFFICIENT_CREDITS',
            'message', format('Need %s credits, have %s', v_total, v_balance)
        );

        UPDATE public.purchase_requests
        SET response_payload = v_response
        WHERE dealer_id = v_user_id
            AND idempotency_key = v_key;

        RETURN v_response;
    END IF;

    UPDATE public.dealers
    SET credits_balance = credits_balance - v_total
    WHERE profile_id = v_dealer_internal_id;

    INSERT INTO public.dealer_subscriptions (
        dealer_id,
        filters,
        is_unfiltered,
        total_quota,
        remaining_quota,
        price_paid_credits,
        price_per_lead,
        pricing_snapshot,
        status
    )
    VALUES (
        v_user_id,
        v_filters,
        (SELECT count(*) FROM jsonb_object_keys(v_filters)) = 0,
        p_quota,
        p_quota,
        v_total,
        COALESCE((v_price->>'perLeadPrice')::NUMERIC, 0),
        v_price,
        'active'
    )
    RETURNING id INTO v_subscription_id;

    -- NEW: Insert into credits_ledger for audit trail
    INSERT INTO public.credits_ledger (
        dealer_id,
        amount,
        transaction_type,
        reference_id,
        running_balance,
        description
    ) VALUES (
        v_dealer_internal_id,
        -v_total,
        'subscription_purchase',
        v_subscription_id,
        v_balance - v_total,
        format('Purchased highly targeted lead pack (%s leads)', p_quota)
    );

    v_response := jsonb_build_object(
        'success', TRUE,
        'subscriptionId', v_subscription_id,
        'price', v_price,
        'deductedCredits', v_total,
        'newBalance', v_balance - v_total
    );

    UPDATE public.purchase_requests
    SET response_payload = v_response
    WHERE dealer_id = v_user_id
        AND idempotency_key = v_key;

    RETURN v_response;
EXCEPTION
    WHEN OTHERS THEN
        v_response := jsonb_build_object(
            'success', FALSE,
            'code', 'PURCHASE_FAILED',
            'message', SQLERRM
        );

        UPDATE public.purchase_requests
        SET response_payload = v_response
        WHERE dealer_id = v_user_id
            AND idempotency_key = v_key;

        RETURN v_response;
END;
$$;


-- 2) Update unlock_lead_v3 to record in credits_ledger
CREATE OR REPLACE FUNCTION public.unlock_lead_v3(
    p_lead_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_unlock_cost INTEGER := 1;
    v_onboarding_credits INTEGER := 500;
    v_balance INTEGER;
    v_new_balance INTEGER;
    v_existing_unlock UUID;
    v_dealer_internal_id UUID;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'code', 'UNAUTHORIZED',
            'message', 'Authentication required'
        );
    END IF;

    SELECT ue.id INTO v_existing_unlock
    FROM public.unlock_events ue
    WHERE ue.lead_id = p_lead_id
        AND ue.dealer_id = v_user_id
    LIMIT 1;

    IF v_existing_unlock IS NOT NULL THEN
        SELECT credits_balance INTO v_balance
        FROM public.dealers
        WHERE profile_id = v_user_id;

        RETURN jsonb_build_object(
            'success', TRUE,
            'alreadyUnlocked', TRUE,
            'creditsRemaining', COALESCE(v_balance, 0),
            'cost', 0
        );
    END IF;

    SELECT
        CASE
            WHEN (value #>> '{}') ~ '^-?[0-9]+$' THEN (value #>> '{}')::INTEGER
            ELSE NULL
        END
    INTO v_unlock_cost
    FROM public.platform_config
    WHERE key = 'lead_unlock_price'
    LIMIT 1;

    v_unlock_cost := COALESCE(v_unlock_cost, 1);

    SELECT
        CASE
            WHEN (value #>> '{}') ~ '^-?[0-9]+$' THEN (value #>> '{}')::INTEGER
            ELSE NULL
        END
    INTO v_onboarding_credits
    FROM public.platform_config
    WHERE key = 'dealer_onboarding_credits'
    LIMIT 1;

    v_onboarding_credits := COALESCE(v_onboarding_credits, 500);

    INSERT INTO public.dealers (profile_id, business_name, credits_balance)
    VALUES (v_user_id, 'My Dealership', v_onboarding_credits)
    ON CONFLICT (profile_id) DO NOTHING;

    -- Atomically lock the dealer record to prevent race conditions (Rules §4.5)
    SELECT profile_id, credits_balance INTO v_dealer_internal_id, v_balance
    FROM public.dealers
    WHERE profile_id = v_user_id
    FOR UPDATE;

    IF v_dealer_internal_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'code', 'DEALER_NOT_FOUND',
            'message', 'Dealer profile unavailable'
        );
    END IF;

    IF v_balance < v_unlock_cost THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'code', 'INSUFFICIENT_CREDITS',
            'message', format('Need %s credits, have %s', v_unlock_cost, v_balance)
        );
    END IF;

    UPDATE public.dealers
    SET credits_balance = credits_balance - v_unlock_cost
    WHERE profile_id = v_dealer_internal_id
    RETURNING credits_balance INTO v_new_balance;

    INSERT INTO public.unlock_events (lead_id, dealer_id, cost_credits)
    VALUES (p_lead_id, v_user_id, v_unlock_cost)
    ON CONFLICT (lead_id, dealer_id) DO NOTHING;

    UPDATE public.leads
    SET status = CASE
        WHEN status = 'new' THEN 'unlocked'
        ELSE status
    END
    WHERE id = p_lead_id;

    -- NEW: Insert into credits_ledger for audit trail
    INSERT INTO public.credits_ledger (
        dealer_id,
        amount,
        transaction_type,
        reference_id,
        running_balance,
        description
    ) VALUES (
        v_dealer_internal_id,
        -v_unlock_cost,
        'lead_unlock',
        p_lead_id,
        v_new_balance,
        format('Unlocked lead %s', p_lead_id)
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'alreadyUnlocked', FALSE,
        'creditsRemaining', v_new_balance,
        'cost', v_unlock_cost
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'code', 'UNLOCK_FAILED',
            'message', SQLERRM
        );
END;
$$;


-- 3) Admin RPC for manual billing adjustments
CREATE OR REPLACE FUNCTION public.admin_adjust_dealer_balance(
    p_dealer_profile_id UUID,
    p_amount INTEGER,
    p_reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_admin_id UUID := auth.uid();
    v_role TEXT;
    v_dealer_internal_id UUID;
    v_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Verify admin role securely (Rules §5.8)
    SELECT role INTO v_role
    FROM public.profiles
    WHERE id = v_admin_id;

    IF v_role NOT IN ('admin', 'super_admin') THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'code', 'UNAUTHORIZED',
            'message', 'Admin access required'
        );
    END IF;

    -- Lock dealer record for update
    SELECT profile_id, credits_balance INTO v_dealer_internal_id, v_balance
    FROM public.dealers
    WHERE profile_id = p_dealer_profile_id
    FOR UPDATE;

    IF v_dealer_internal_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'code', 'DEALER_NOT_FOUND',
            'message', 'Dealer profile not found'
        );
    END IF;

    v_new_balance := v_balance + p_amount;

    -- Prevent negative balance
    IF v_new_balance < 0 THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'code', 'INVALID_ADJUSTMENT',
            'message', 'Adjustment would result in negative balance'
        );
    END IF;

    UPDATE public.dealers
    SET credits_balance = v_new_balance
    WHERE profile_id = v_dealer_internal_id;

    -- Insert audit log for the adjustment itself
    INSERT INTO public.billing_adjustments (
        dealer_id,
        admin_id,
        amount,
        reason
    ) VALUES (
        v_dealer_internal_id,
        v_admin_id,
        p_amount,
        p_reason
    );

    -- Insert into credits ledger
    INSERT INTO public.credits_ledger (
        dealer_id,
        amount,
        transaction_type,
        running_balance,
        description
    ) VALUES (
        v_dealer_internal_id,
        p_amount,
        'admin_adjustment',
        v_new_balance,
        format('Admin adjustment: %s', p_reason)
    );

    RETURN jsonb_build_object(
        'success', TRUE,
        'code', 'BALANCE_ADJUSTED',
        'previousBalance', v_balance,
        'newBalance', v_new_balance,
        'amount', p_amount
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.purchase_subscription_v3(JSONB, INTEGER, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unlock_lead_v3(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_adjust_dealer_balance(UUID, INTEGER, TEXT) TO authenticated;
