-- Patch: Outbid notifications for place_bid RPC
-- Applies to already-migrated environments where 20260219_bidding_optimization.sql is already executed.

CREATE OR REPLACE FUNCTION public.place_bid(
    p_auction_id UUID,
    p_bidder_id UUID,
    p_amount NUMERIC
) 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_auction RECORD;
    v_min_required NUMERIC;
    v_bid_id UUID;
    v_prev_highest_bidder_id UUID;
    v_prev_highest_amount NUMERIC;
    v_outbid_notified BOOLEAN := FALSE;
BEGIN
    -- 1. Lock the auction row for update to prevent race conditions
    SELECT * INTO v_auction
    FROM public.auctions
    WHERE id = p_auction_id
    FOR UPDATE;

    -- 2. Validations
    IF v_auction IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Auction not found');
    END IF;

    IF v_auction.status != 'live' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Auction is not live');
    END IF;

    IF v_auction.end_time < NOW() THEN
        RETURN jsonb_build_object('success', false, 'message', 'Auction has ended');
    END IF;

    v_min_required := COALESCE(v_auction.current_highest_bid, v_auction.start_price) + COALESCE(v_auction.min_bid_increment, v_auction.min_increment, 0);

    IF v_auction.current_highest_bid IS NULL THEN
        v_min_required := v_auction.start_price;
    END IF;

    IF p_amount < v_min_required THEN
        RETURN jsonb_build_object('success', false, 'message', 'Bid amount too low. Min: ' || v_min_required);
    END IF;

    -- Capture current highest bidder BEFORE inserting new bid
    SELECT b.bidder_id, b.amount
    INTO v_prev_highest_bidder_id, v_prev_highest_amount
    FROM public.bids b
    WHERE b.auction_id = p_auction_id
    ORDER BY b.amount DESC, b.created_at DESC
    LIMIT 1;

    -- 3. Insert Bid
    INSERT INTO public.bids (auction_id, bidder_id, amount)
    VALUES (p_auction_id, p_bidder_id, p_amount)
    RETURNING id INTO v_bid_id;

    -- 4. Update Auction (Highest Bid & Anti-Sniping Extension)
    UPDATE public.auctions
    SET 
        current_highest_bid = p_amount,
        highest_bidder_id = p_bidder_id,
        end_time = CASE 
            WHEN end_time - NOW() < interval '2 minutes' THEN end_time + interval '2 minutes'
            ELSE end_time 
        END,
        updated_at = NOW()
    WHERE id = p_auction_id;

    -- 5. Notify previous highest bidder if outbid by someone else
    IF v_prev_highest_bidder_id IS NOT NULL AND v_prev_highest_bidder_id <> p_bidder_id THEN
        BEGIN
            INSERT INTO public.notifications (user_id, title, message, type, link)
            VALUES (
                v_prev_highest_bidder_id,
                'You have been outbid',
                'Your previous highest bid of ₹' || COALESCE(v_prev_highest_amount::text, '0') ||
                ' was outbid. New highest bid is ₹' || p_amount::text || '.',
                'warning',
                '/auctions/' || p_auction_id::text
            );
            v_outbid_notified := TRUE;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Outbid notification failed for auction %: %', p_auction_id, SQLERRM;
        END;
    END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'proccessed_at', NOW(),
        'bid_id', v_bid_id,
        'new_end_time', (SELECT end_time FROM public.auctions WHERE id = p_auction_id),
        'outbid_notified', v_outbid_notified
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'message', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION public.place_bid(UUID, UUID, NUMERIC) TO authenticated;
