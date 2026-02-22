-- Lead Engine Hardening v3
-- Fixes:
-- 1) Transaction-safe unlock flow
-- 2) v2 -> v3 RPC alignment
-- 3) Allocation failure observability
-- 4) Remove hardcoded onboarding credits (config-driven)
-- 5) Stronger allocation/audit controls

-- ---------------------------------------------------------------------
-- 0) Configuration + schema extensions
-- ---------------------------------------------------------------------

INSERT INTO public.platform_config (key, value, label, category, description)
VALUES (
    'dealer_onboarding_credits',
    '500',
    'Dealer Onboarding Credits',
    'pricing',
    'Credits granted when a dealer account is initialized for lead unlock flow'
)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.lead_pricing_config
    ADD COLUMN IF NOT EXISTS allocation_mode TEXT NOT NULL DEFAULT 'broadcast'
        CHECK (allocation_mode IN ('broadcast', 'priority', 'exclusive')),
    ADD COLUMN IF NOT EXISTS max_dealers_per_lead INTEGER NOT NULL DEFAULT 0
        CHECK (max_dealers_per_lead >= 0);

ALTER TABLE public.dealer_subscriptions
    ADD COLUMN IF NOT EXISTS last_allocated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_dealer_subscriptions_filters_gin
    ON public.dealer_subscriptions USING GIN (filters);

CREATE INDEX IF NOT EXISTS idx_dealer_subscriptions_active_quota
    ON public.dealer_subscriptions(status, remaining_quota);

CREATE INDEX IF NOT EXISTS idx_dealer_subscriptions_dealer_status
    ON public.dealer_subscriptions(dealer_id, status);

CREATE TABLE IF NOT EXISTS public.purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dealer_id UUID NOT NULL REFERENCES public.dealers(profile_id) ON DELETE CASCADE,
    idempotency_key TEXT NOT NULL,
    request_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    response_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (dealer_id, idempotency_key)
);

ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dealer View Own Purchase Requests" ON public.purchase_requests;
CREATE POLICY "Dealer View Own Purchase Requests"
ON public.purchase_requests
FOR SELECT
USING (dealer_id = auth.uid());

DROP POLICY IF EXISTS "Admin Manage Purchase Requests" ON public.purchase_requests;
CREATE POLICY "Admin Manage Purchase Requests"
ON public.purchase_requests
FOR ALL
USING (public.is_admin_or_superadmin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.lead_allocation_failures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    source TEXT NOT NULL DEFAULT 'unknown',
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_lead_allocation_failures_created
    ON public.lead_allocation_failures(created_at DESC);

ALTER TABLE public.lead_allocation_failures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin Read Allocation Failures" ON public.lead_allocation_failures;
CREATE POLICY "Admin Read Allocation Failures"
ON public.lead_allocation_failures
FOR SELECT
USING (public.is_admin_or_superadmin(auth.uid()));

DROP POLICY IF EXISTS "Service Insert Allocation Failures" ON public.lead_allocation_failures;
CREATE POLICY "Service Insert Allocation Failures"
ON public.lead_allocation_failures
FOR INSERT
WITH CHECK (true);

-- Idempotency hardening: one unlock per (lead, dealer)
DELETE FROM public.unlock_events a
USING public.unlock_events b
WHERE a.ctid < b.ctid
  AND a.lead_id = b.lead_id
  AND a.dealer_id = b.dealer_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unlock_events_lead_dealer_unique
    ON public.unlock_events(lead_id, dealer_id);

-- ---------------------------------------------------------------------
-- 1) Allocation primitive hardening
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.allocate_lead_to_sub(
    p_lead_id UUID,
    p_subscription_id UUID,
    p_dealer_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_remaining INTEGER;
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.lead_allocations
        WHERE lead_id = p_lead_id
          AND dealer_id = p_dealer_id
    ) THEN
        RETURN FALSE;
    END IF;

    SELECT remaining_quota INTO v_remaining
    FROM public.dealer_subscriptions
    WHERE id = p_subscription_id
      AND status = 'active'
    FOR UPDATE;

    IF v_remaining IS NULL OR v_remaining <= 0 THEN
        RETURN FALSE;
    END IF;

    INSERT INTO public.unlock_events (lead_id, dealer_id, cost_credits)
    VALUES (p_lead_id, p_dealer_id, 0)
    ON CONFLICT (lead_id, dealer_id) DO NOTHING;

    INSERT INTO public.lead_allocations (lead_id, subscription_id, dealer_id)
    VALUES (p_lead_id, p_subscription_id, p_dealer_id)
    ON CONFLICT (lead_id, dealer_id) DO NOTHING;

    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;

    UPDATE public.dealer_subscriptions
    SET remaining_quota = remaining_quota - 1,
        status = CASE WHEN remaining_quota - 1 <= 0 THEN 'exhausted' ELSE 'active' END,
        last_allocated_at = now(),
        updated_at = now()
    WHERE id = p_subscription_id;

    UPDATE public.leads
    SET status = CASE
        WHEN status = 'new' THEN 'unlocked'
        ELSE status
    END
    WHERE id = p_lead_id;

    RETURN TRUE;
END;
$$;

-- ---------------------------------------------------------------------
-- 2) v3 pricing & purchase RPCs
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.calculate_subscription_price_v3(
    p_filters JSONB DEFAULT '{}'::jsonb,
    p_quantity INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_cfg public.lead_pricing_config%ROWTYPE;
    v_result JSONB;
BEGIN
    v_result := public.calculate_subscription_price_v2(
        COALESCE(jsonb_strip_nulls(p_filters), '{}'::jsonb),
        GREATEST(1, COALESCE(p_quantity, 1))
    );

    SELECT * INTO v_cfg
    FROM public.lead_pricing_config
    LIMIT 1;

    RETURN v_result || jsonb_build_object(
        'allocationMode', COALESCE(v_cfg.allocation_mode, 'broadcast'),
        'maxDealersPerLead', COALESCE(v_cfg.max_dealers_per_lead, 0)
    );
END;
$$;

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

    SELECT credits_balance INTO v_balance
    FROM public.dealers
    WHERE profile_id = v_user_id
    FOR UPDATE;

    IF v_balance IS NULL THEN
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
    WHERE profile_id = v_user_id;

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

-- ---------------------------------------------------------------------
-- 3) v3 allocation RPC
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.allocate_new_lead_v3(
    p_lead_id UUID,
    p_lead_attributes JSONB,
    p_lead_created_at TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_sub RECORD;
    v_allocated JSONB := '[]'::jsonb;
    v_alloc_success BOOLEAN;
    v_cfg public.lead_pricing_config%ROWTYPE;
    v_mode TEXT := 'broadcast';
    v_max INTEGER := 0;
    v_count INTEGER := 0;
BEGIN
    SELECT * INTO v_cfg
    FROM public.lead_pricing_config
    LIMIT 1;

    v_mode := COALESCE(v_cfg.allocation_mode, 'broadcast');
    v_max := COALESCE(v_cfg.max_dealers_per_lead, 0);

    FOR v_sub IN
        SELECT id, dealer_id, filters, remaining_quota, created_at
        FROM public.dealer_subscriptions
        WHERE status = 'active'
          AND remaining_quota > 0
          AND (expires_at IS NULL OR expires_at >= NOW())
        ORDER BY
          CASE WHEN v_mode = 'priority' THEN remaining_quota END DESC NULLS LAST,
          created_at ASC
    LOOP
        IF v_max > 0 AND v_count >= v_max THEN
            EXIT;
        END IF;

        IF public.subscription_matches_lead_v2(v_sub.filters, p_lead_attributes, p_lead_created_at) THEN
            SELECT public.allocate_lead_to_sub(p_lead_id, v_sub.id, v_sub.dealer_id)
            INTO v_alloc_success;

            IF v_alloc_success THEN
                v_count := v_count + 1;
                v_allocated := v_allocated || jsonb_build_array(
                    jsonb_build_object(
                        'subscriptionId', v_sub.id,
                        'dealerId', v_sub.dealer_id
                    )
                );

                IF v_mode = 'exclusive' THEN
                    EXIT;
                END IF;
            END IF;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'success', TRUE,
        'allocated', v_allocated,
        'count', v_count,
        'allocationMode', v_mode,
        'maxDealersPerLead', v_max
    );
EXCEPTION
    WHEN OTHERS THEN
        INSERT INTO public.lead_allocation_failures (lead_id, source, payload, error_message)
        VALUES (
            p_lead_id,
            'allocate_new_lead_v3',
            jsonb_build_object(
                'leadAttributes', p_lead_attributes,
                'leadCreatedAt', p_lead_created_at
            ),
            SQLERRM
        );

        RETURN jsonb_build_object(
            'success', FALSE,
            'code', 'ALLOCATION_FAILED',
            'message', SQLERRM
        );
END;
$$;

-- ---------------------------------------------------------------------
-- 4) Atomic unlock RPC (transaction integrity)
-- ---------------------------------------------------------------------

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

    SELECT credits_balance INTO v_balance
    FROM public.dealers
    WHERE profile_id = v_user_id
    FOR UPDATE;

    IF v_balance IS NULL THEN
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
    WHERE profile_id = v_user_id
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

-- ---------------------------------------------------------------------
-- 5) Trigger upgrade to v3 + failure capture
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.auto_allocate_lead_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_listing RECORD;
    v_region TEXT;
    v_payload JSONB;
BEGIN
    SELECT city, make, model, specs
    INTO v_listing
    FROM public.listings
    WHERE id = NEW.listing_id;

    IF v_listing IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT region
    INTO v_region
    FROM public.city_region_map
    WHERE is_active = TRUE
      AND lower(city) = lower(v_listing.city)
    LIMIT 1;

    v_payload := jsonb_strip_nulls(
        jsonb_build_object(
            'city', v_listing.city,
            'region', v_region,
            'brand', v_listing.make,
            'make', v_listing.make,
            'model', v_listing.model,
            'lead_type', COALESCE(v_listing.specs->>'lead_type', 'buy_used')
        )
    );

    PERFORM public.allocate_new_lead_v3(
        NEW.id,
        v_payload,
        COALESCE(NEW.created_at, now())
    );

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        INSERT INTO public.lead_allocation_failures (lead_id, source, payload, error_message)
        VALUES (
            NEW.id,
            'auto_allocate_lead_on_insert',
            jsonb_build_object('listing_id', NEW.listing_id),
            SQLERRM
        );
        RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------
-- 6) Grants
-- ---------------------------------------------------------------------

GRANT EXECUTE ON FUNCTION public.calculate_subscription_price_v3(JSONB, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_subscription_v3(JSONB, INTEGER, INTEGER, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.allocate_new_lead_v3(UUID, JSONB, TIMESTAMPTZ) TO service_role;
GRANT EXECUTE ON FUNCTION public.unlock_lead_v3(UUID) TO authenticated;

