-- Payment hardening v2: strict idempotency for credit purchases.
-- Prevents duplicate wallet credits when verify endpoint and webhook race.

CREATE OR REPLACE FUNCTION public.handle_credit_purchase(
    p_dealer_id UUID,
    p_amount NUMERIC,
    p_credits INTEGER,
    p_gst NUMERIC,
    p_order_id TEXT,
    p_payment_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_existing RECORD;
    v_new_balance INTEGER;
    v_rows_affected INTEGER;
BEGIN
    SELECT id, dealer_id, status
    INTO v_existing
    FROM public.transactions
    WHERE razorpay_order_id = p_order_id
    FOR UPDATE;

    IF v_existing.id IS NOT NULL THEN
        IF v_existing.dealer_id <> p_dealer_id THEN
            RETURN jsonb_build_object(
                'success', FALSE,
                'message', 'Order already linked to another dealer'
            );
        END IF;

        IF v_existing.status = 'success' THEN
            SELECT credits_balance INTO v_new_balance
            FROM public.dealers
            WHERE profile_id = p_dealer_id;

            RETURN jsonb_build_object(
                'success', TRUE,
                'message', 'Already processed',
                'new_balance', COALESCE(v_new_balance, 0),
                'is_duplicate', TRUE
            );
        END IF;

        UPDATE public.transactions
        SET
            amount = p_amount,
            credits_purchased = p_credits,
            gst_amount = p_gst,
            razorpay_payment_id = p_payment_id,
            status = 'success',
            type = 'credit_purchase',
            updated_at = NOW()
        WHERE id = v_existing.id
          AND status <> 'success';

        GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
        IF v_rows_affected = 0 THEN
            SELECT credits_balance INTO v_new_balance
            FROM public.dealers
            WHERE profile_id = p_dealer_id;

            RETURN jsonb_build_object(
                'success', TRUE,
                'message', 'Already processed',
                'new_balance', COALESCE(v_new_balance, 0),
                'is_duplicate', TRUE
            );
        END IF;
    ELSE
        INSERT INTO public.transactions (
            dealer_id,
            amount,
            credits_purchased,
            gst_amount,
            razorpay_order_id,
            razorpay_payment_id,
            status,
            type
        ) VALUES (
            p_dealer_id,
            p_amount,
            p_credits,
            p_gst,
            p_order_id,
            p_payment_id,
            'success',
            'credit_purchase'
        )
        ON CONFLICT (razorpay_order_id) DO NOTHING;

        GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
        IF v_rows_affected = 0 THEN
            SELECT credits_balance INTO v_new_balance
            FROM public.dealers
            WHERE profile_id = p_dealer_id;

            RETURN jsonb_build_object(
                'success', TRUE,
                'message', 'Already processed',
                'new_balance', COALESCE(v_new_balance, 0),
                'is_duplicate', TRUE
            );
        END IF;
    END IF;

    UPDATE public.dealers
    SET credits_balance = credits_balance + p_credits
    WHERE profile_id = p_dealer_id
    RETURNING credits_balance INTO v_new_balance;

    IF v_new_balance IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', 'Dealer not found'
        );
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'message', 'Credits added successfully',
        'new_balance', v_new_balance,
        'is_duplicate', FALSE
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'message', SQLERRM
        );
END;
$$;
