-- Migration: Add secure transactional RPC for Razorpay webhooks
-- Description: Ensures atomicity when adding credits via webhook (transactions + dealers balance update)
-- Created At: 2026-02-22

CREATE OR REPLACE FUNCTION process_razorpay_credit_purchase(
    p_dealer_id UUID,
    p_amount NUMERIC,
    p_credits INT,
    p_gst NUMERIC,
    p_order_id TEXT,
    p_payment_id TEXT
) RETURNS JSONB AS $$
DECLARE
    v_existing_txn_status TEXT;
    v_current_balance INT;
    v_new_balance INT;
    v_result JSONB;
BEGIN
    -- 1. Idempotency Check (Pessimistic Lock on dealer row not strictly needed for idempotency check, but good for balance)
    SELECT status INTO v_existing_txn_status 
    FROM transactions 
    WHERE razorpay_order_id = p_order_id;

    IF v_existing_txn_status = 'success' THEN
        RETURN jsonb_build_object('success', true, 'message', 'Already processed');
    END IF;

    -- 2. Lock the dealer row to prevent race conditions during balance update
    SELECT credits_balance INTO v_current_balance
    FROM dealers
    WHERE profile_id = p_dealer_id
    FOR UPDATE;

    IF v_current_balance IS NULL THEN
        RAISE EXCEPTION 'Dealer not found';
    END IF;

    -- 3. Calculate new balance
    v_new_balance := v_current_balance + p_credits;

    -- 4. Record Transaction
    IF v_existing_txn_status IS NULL THEN
        INSERT INTO transactions (
            dealer_id, amount, credits_purchased, gst_amount, 
            razorpay_order_id, razorpay_payment_id, status, type
        ) VALUES (
            p_dealer_id, p_amount, p_credits, p_gst, 
            p_order_id, p_payment_id, 'success', 'credit_purchase'
        );
    ELSE
        -- If transaction exists but wasn't successful, update it safely
        UPDATE transactions
        SET status = 'success', razorpay_payment_id = p_payment_id
        WHERE razorpay_order_id = p_order_id;
    END IF;

    -- 5. Update Dealer Credits Balance
    UPDATE dealers
    SET credits_balance = v_new_balance
    WHERE profile_id = p_dealer_id;

    -- Return success payload
    v_result := jsonb_build_object(
        'success', true,
        'new_balance', v_new_balance,
        'credits_added', p_credits
    );
    
    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    -- In PL/pgSQL, an unhandled exception automatically rolls back the entire transaction.
    RAISE LOG 'process_razorpay_credit_purchase failed: % %', SQLERRM, SQLSTATE;
    RAISE; -- Re-throw the error
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
