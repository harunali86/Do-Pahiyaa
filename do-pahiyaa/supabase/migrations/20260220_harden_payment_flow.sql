-- Migration: Harden Payment Flow
-- Description: Adds unique constraint to razorpay_order_id and creates an idempotent RPC for credit purchases.

-- 1. Add Unique Constraint to razorpay_order_id to prevent duplicate processing at DB level
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_transactions_razorpay_order_id'
    ) THEN
        ALTER TABLE public.transactions ADD CONSTRAINT uq_transactions_razorpay_order_id UNIQUE (razorpay_order_id);
    END IF;
END $$;

-- 2. RPC for Atomic and Idempotent Credit Purchase
-- This ensures that either both the transaction is recorded and balance is updated, or neither.
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
    v_existing_status TEXT;
    v_new_balance INTEGER;
BEGIN
    -- 1. Idempotency Check: Check if this order was already successfully processed
    SELECT status INTO v_existing_status
    FROM public.transactions
    WHERE razorpay_order_id = p_order_id;

    IF v_existing_status = 'success' THEN
        SELECT credits_balance INTO v_new_balance FROM public.dealers WHERE profile_id = p_dealer_id;
        RETURN jsonb_build_object(
            'success', true, 
            'message', 'Already processed',
            'new_balance', v_new_balance,
            'is_duplicate', true
        );
    END IF;

    -- 2. Upsert Transaction Record
    -- Using UPSERT to handle races where webhook and frontend verify might hit simultaneously
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
    ON CONFLICT (razorpay_order_id) 
    DO UPDATE SET 
        razorpay_payment_id = EXCLUDED.razorpay_payment_id,
        status = 'success',
        updated_at = NOW()
    WHERE public.transactions.status != 'success';

    -- 3. Atomically Update Dealer Balance
    UPDATE public.dealers
    SET credits_balance = credits_balance + p_credits
    WHERE profile_id = p_dealer_id
    RETURNING credits_balance INTO v_new_balance;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Credits added successfully',
        'new_balance', v_new_balance,
        'is_duplicate', false
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'message', SQLERRM
    );
END;
$$;
