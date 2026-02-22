-- Phase 17 (V2): Dealer Filter Purchase + Dynamic Pricing Hardening
-- Backward-compatible extension over existing Phase 17 schema.

-- 1) Shared helper for policies
CREATE OR REPLACE FUNCTION public.is_admin_or_superadmin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = p_user_id
      AND role::text IN ('admin', 'super_admin')
  );
$$;

-- 2) Core pricing config (single-row table)
CREATE TABLE IF NOT EXISTS public.lead_pricing_config (
    id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
    base_lead_price NUMERIC(10,2) NOT NULL DEFAULT 1,
    filtered_lead_surcharge NUMERIC(10,2) NOT NULL DEFAULT 0,
    filtered_lead_multiplier NUMERIC(10,2) NOT NULL DEFAULT 1,
    min_purchase_qty INTEGER NOT NULL DEFAULT 10,
    filter_city_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    filter_region_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    filter_brand_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    filter_model_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    filter_lead_type_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    filter_date_range_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.lead_pricing_config (id)
VALUES (TRUE)
ON CONFLICT (id) DO NOTHING;

-- 3) Optional city->region mapping for region pricing and allocation
CREATE TABLE IF NOT EXISTS public.city_region_map (
    city TEXT PRIMARY KEY,
    region TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_city_region_active ON public.city_region_map (is_active);
CREATE INDEX IF NOT EXISTS idx_city_region_region ON public.city_region_map (region);

-- 4) Bulk discount tiers
CREATE TABLE IF NOT EXISTS public.pricing_bulk_discounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    min_quantity INTEGER NOT NULL CHECK (min_quantity > 0),
    max_quantity INTEGER CHECK (max_quantity IS NULL OR max_quantity >= min_quantity),
    discount_type TEXT NOT NULL CHECK (discount_type IN ('flat', 'percentage')),
    discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    priority INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bulk_discounts_active ON public.pricing_bulk_discounts (is_active);
CREATE INDEX IF NOT EXISTS idx_bulk_discounts_priority ON public.pricing_bulk_discounts (priority DESC, min_quantity DESC);

-- 5) Extend dealer subscriptions without breaking existing flows
ALTER TABLE public.dealer_subscriptions
    ADD COLUMN IF NOT EXISTS is_unfiltered BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS price_per_lead NUMERIC(10,2),
    ADD COLUMN IF NOT EXISTS pricing_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_dealer_subs_unfiltered ON public.dealer_subscriptions (is_unfiltered);
CREATE INDEX IF NOT EXISTS idx_dealer_subs_expires_at ON public.dealer_subscriptions (expires_at);

-- 6) RLS hardening and admin/super_admin support
ALTER TABLE public.lead_pricing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_region_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_bulk_discounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Pricing Rules" ON public.pricing_rules;
DROP POLICY IF EXISTS "Admin Manage Pricing Rules" ON public.pricing_rules;

CREATE POLICY "Public Read Pricing Rules"
ON public.pricing_rules
FOR SELECT
USING (TRUE);

CREATE POLICY "Admin Manage Pricing Rules"
ON public.pricing_rules
FOR ALL
USING (public.is_admin_or_superadmin(auth.uid()));

DROP POLICY IF EXISTS "Public Read Lead Pricing Config" ON public.lead_pricing_config;
DROP POLICY IF EXISTS "Admin Manage Lead Pricing Config" ON public.lead_pricing_config;

CREATE POLICY "Public Read Lead Pricing Config"
ON public.lead_pricing_config
FOR SELECT
USING (TRUE);

CREATE POLICY "Admin Manage Lead Pricing Config"
ON public.lead_pricing_config
FOR ALL
USING (public.is_admin_or_superadmin(auth.uid()));

DROP POLICY IF EXISTS "Public Read City Region Map" ON public.city_region_map;
DROP POLICY IF EXISTS "Admin Manage City Region Map" ON public.city_region_map;

CREATE POLICY "Public Read City Region Map"
ON public.city_region_map
FOR SELECT
USING (TRUE);

CREATE POLICY "Admin Manage City Region Map"
ON public.city_region_map
FOR ALL
USING (public.is_admin_or_superadmin(auth.uid()));

DROP POLICY IF EXISTS "Public Read Bulk Discounts" ON public.pricing_bulk_discounts;
DROP POLICY IF EXISTS "Admin Manage Bulk Discounts" ON public.pricing_bulk_discounts;

CREATE POLICY "Public Read Bulk Discounts"
ON public.pricing_bulk_discounts
FOR SELECT
USING (TRUE);

CREATE POLICY "Admin Manage Bulk Discounts"
ON public.pricing_bulk_discounts
FOR ALL
USING (public.is_admin_or_superadmin(auth.uid()));

DROP POLICY IF EXISTS "Admin Manage Subscriptions" ON public.dealer_subscriptions;
CREATE POLICY "Admin Manage Subscriptions"
ON public.dealer_subscriptions
FOR ALL
USING (public.is_admin_or_superadmin(auth.uid()));

DROP POLICY IF EXISTS "Admin Manage Allocations" ON public.lead_allocations;
CREATE POLICY "Admin Manage Allocations"
ON public.lead_allocations
FOR ALL
USING (public.is_admin_or_superadmin(auth.uid()));

-- 7) Price calculation RPC (server-authoritative, no hardcoded pricing)
CREATE OR REPLACE FUNCTION public.calculate_subscription_price_v2(
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
    v_filters JSONB := COALESCE(jsonb_strip_nulls(p_filters), '{}'::jsonb);
    v_has_filters BOOLEAN := (SELECT count(*) FROM jsonb_object_keys(v_filters)) > 0;
    v_per_lead NUMERIC(12,2);
    v_subtotal NUMERIC(12,2);
    v_discount NUMERIC(12,2) := 0;
    v_total INTEGER := 0;
    v_adjustments JSONB := '[]'::jsonb;
    v_rule RECORD;
    v_rule_match BOOLEAN;
    v_adjustment_amount NUMERIC(12,2);
    v_bulk public.pricing_bulk_discounts%ROWTYPE;
    v_min_qty INTEGER;
    v_date_range_filter TEXT;
BEGIN
    SELECT * INTO v_cfg
    FROM public.lead_pricing_config
    LIMIT 1;

    IF NOT FOUND THEN
        INSERT INTO public.lead_pricing_config (id) VALUES (TRUE)
        ON CONFLICT (id) DO NOTHING;

        SELECT * INTO v_cfg
        FROM public.lead_pricing_config
        LIMIT 1;
    END IF;

    v_min_qty := GREATEST(1, COALESCE(v_cfg.min_purchase_qty, 1));
    IF p_quantity < v_min_qty THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'code', 'MIN_PURCHASE_QTY',
            'message', format('Minimum purchase quantity is %s', v_min_qty),
            'minQuantity', v_min_qty
        );
    END IF;

    IF (v_filters ? 'city') AND NOT COALESCE(v_cfg.filter_city_enabled, TRUE) THEN
        RETURN jsonb_build_object('success', FALSE, 'code', 'FILTER_DISABLED', 'message', 'City filter is disabled by admin');
    END IF;
    IF (v_filters ? 'region') AND NOT COALESCE(v_cfg.filter_region_enabled, TRUE) THEN
        RETURN jsonb_build_object('success', FALSE, 'code', 'FILTER_DISABLED', 'message', 'Region filter is disabled by admin');
    END IF;
    IF (v_filters ? 'brand') AND NOT COALESCE(v_cfg.filter_brand_enabled, TRUE) THEN
        RETURN jsonb_build_object('success', FALSE, 'code', 'FILTER_DISABLED', 'message', 'Brand filter is disabled by admin');
    END IF;
    IF (v_filters ? 'model') AND NOT COALESCE(v_cfg.filter_model_enabled, TRUE) THEN
        RETURN jsonb_build_object('success', FALSE, 'code', 'FILTER_DISABLED', 'message', 'Model filter is disabled by admin');
    END IF;
    IF ((v_filters ? 'lead_type') OR (v_filters ? 'leadType')) AND NOT COALESCE(v_cfg.filter_lead_type_enabled, TRUE) THEN
        RETURN jsonb_build_object('success', FALSE, 'code', 'FILTER_DISABLED', 'message', 'Lead type filter is disabled by admin');
    END IF;
    IF ((v_filters ? 'date_range') OR (v_filters ? 'dateRange') OR (v_filters ? 'start_date') OR (v_filters ? 'end_date'))
       AND NOT COALESCE(v_cfg.filter_date_range_enabled, TRUE) THEN
        RETURN jsonb_build_object('success', FALSE, 'code', 'FILTER_DISABLED', 'message', 'Date range filter is disabled by admin');
    END IF;

    v_per_lead := COALESCE(v_cfg.base_lead_price, 1);

    IF v_has_filters THEN
        v_per_lead := (v_per_lead * COALESCE(v_cfg.filtered_lead_multiplier, 1))
                      + COALESCE(v_cfg.filtered_lead_surcharge, 0);
    END IF;

    v_date_range_filter := COALESCE(v_filters->>'date_range', v_filters->>'dateRange');

    FOR v_rule IN
        SELECT *
        FROM public.pricing_rules
        WHERE is_active = TRUE
          AND condition_type <> 'base_price'
        ORDER BY priority DESC, created_at ASC
    LOOP
        v_rule_match := FALSE;

        IF v_rule.condition_type = 'city' THEN
            v_rule_match := LOWER(COALESCE(v_filters->>'city', '')) = LOWER(v_rule.condition_value);
        ELSIF v_rule.condition_type = 'region' THEN
            v_rule_match := LOWER(COALESCE(v_filters->>'region', '')) = LOWER(v_rule.condition_value);
        ELSIF v_rule.condition_type = 'brand' THEN
            v_rule_match := LOWER(COALESCE(v_filters->>'brand', '')) = LOWER(v_rule.condition_value);
        ELSIF v_rule.condition_type = 'model' THEN
            v_rule_match := LOWER(COALESCE(v_filters->>'model', '')) = LOWER(v_rule.condition_value);
        ELSIF v_rule.condition_type = 'lead_type' THEN
            v_rule_match := LOWER(COALESCE(v_filters->>'lead_type', v_filters->>'leadType')) = LOWER(v_rule.condition_value);
        ELSIF v_rule.condition_type = 'date_range' THEN
            v_rule_match := LOWER(COALESCE(v_date_range_filter, '')) = LOWER(v_rule.condition_value);
            IF NOT v_rule_match AND LOWER(v_rule.condition_value) = 'custom_range' THEN
                v_rule_match := (v_filters ? 'start_date') OR (v_filters ? 'end_date');
            END IF;
        ELSIF v_rule.condition_type = 'filtered' THEN
            v_rule_match := v_has_filters;
        ELSIF v_rule.condition_type = 'unfiltered' THEN
            v_rule_match := NOT v_has_filters;
        END IF;

        IF v_rule_match THEN
            v_adjustment_amount := 0;
            IF v_rule.adjustment_type = 'flat_fee' THEN
                v_adjustment_amount := COALESCE(v_rule.adjustment_value, 0);
                v_per_lead := v_per_lead + v_adjustment_amount;
            ELSIF v_rule.adjustment_type = 'multiplier' THEN
                v_adjustment_amount := v_per_lead * (COALESCE(v_rule.adjustment_value, 1) - 1);
                v_per_lead := v_per_lead * COALESCE(v_rule.adjustment_value, 1);
            ELSIF v_rule.adjustment_type = 'percentage' THEN
                v_adjustment_amount := v_per_lead * (COALESCE(v_rule.adjustment_value, 0) / 100);
                v_per_lead := v_per_lead + v_adjustment_amount;
            END IF;

            v_adjustments := v_adjustments || jsonb_build_array(
                jsonb_build_object(
                    'ruleId', v_rule.id,
                    'ruleName', v_rule.name,
                    'conditionType', v_rule.condition_type,
                    'adjustmentType', v_rule.adjustment_type,
                    'amount', ROUND(v_adjustment_amount, 2)
                )
            );
        END IF;
    END LOOP;

    IF v_per_lead < 0 THEN
        v_per_lead := 0;
    END IF;

    v_subtotal := CEIL(v_per_lead * p_quantity);

    SELECT *
    INTO v_bulk
    FROM public.pricing_bulk_discounts
    WHERE is_active = TRUE
      AND p_quantity >= min_quantity
      AND (max_quantity IS NULL OR p_quantity <= max_quantity)
    ORDER BY priority DESC, min_quantity DESC
    LIMIT 1;

    IF FOUND THEN
        IF v_bulk.discount_type = 'flat' THEN
            v_discount := COALESCE(v_bulk.discount_value, 0);
        ELSIF v_bulk.discount_type = 'percentage' THEN
            v_discount := v_subtotal * (COALESCE(v_bulk.discount_value, 0) / 100);
        END IF;
    END IF;

    IF v_discount > v_subtotal THEN
        v_discount := v_subtotal;
    END IF;

    v_total := CEIL(v_subtotal - v_discount);

    RETURN jsonb_build_object(
        'success', TRUE,
        'basePrice', ROUND(COALESCE(v_cfg.base_lead_price, 1), 2),
        'hasFilters', v_has_filters,
        'perLeadPrice', ROUND(v_per_lead, 2),
        'quantity', p_quantity,
        'subtotal', ROUND(v_subtotal, 2),
        'bulkDiscount', ROUND(v_discount, 2),
        'totalPrice', v_total,
        'minQuantity', v_min_qty,
        'adjustments', v_adjustments
    );
END;
$$;

-- 8) Purchase RPC (atomic, transaction-safe, backward-compatible)
CREATE OR REPLACE FUNCTION public.purchase_subscription_v2(
    p_dealer_id UUID,
    p_filters JSONB,
    p_quota INTEGER,
    p_expected_total INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_price JSONB;
    v_total INTEGER;
    v_balance INTEGER;
    v_subscription_id UUID;
    v_filters JSONB := COALESCE(jsonb_strip_nulls(p_filters), '{}'::jsonb);
BEGIN
    v_price := public.calculate_subscription_price_v2(v_filters, p_quota);

    IF COALESCE((v_price->>'success')::BOOLEAN, FALSE) = FALSE THEN
        RETURN v_price;
    END IF;

    v_total := COALESCE((v_price->>'totalPrice')::INTEGER, 0);

    IF p_expected_total IS NOT NULL AND p_expected_total <> v_total THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'code', 'PRICE_MISMATCH',
            'message', format('Expected %s but current price is %s', p_expected_total, v_total),
            'currentPrice', v_total
        );
    END IF;

    SELECT credits_balance INTO v_balance
    FROM public.dealers
    WHERE profile_id = p_dealer_id
    FOR UPDATE;

    IF v_balance IS NULL THEN
        RETURN jsonb_build_object('success', FALSE, 'code', 'DEALER_NOT_FOUND', 'message', 'Dealer not found');
    END IF;

    IF v_balance < v_total THEN
        RETURN jsonb_build_object('success', FALSE, 'code', 'INSUFFICIENT_CREDITS', 'message', 'Insufficient credits');
    END IF;

    UPDATE public.dealers
    SET credits_balance = credits_balance - v_total
    WHERE profile_id = p_dealer_id;

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
        p_dealer_id,
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

    RETURN jsonb_build_object(
        'success', TRUE,
        'subscriptionId', v_subscription_id,
        'price', v_price,
        'deductedCredits', v_total,
        'newBalance', v_balance - v_total
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', FALSE,
        'code', 'PURCHASE_FAILED',
        'message', SQLERRM
    );
END;
$$;

-- 9) Lead/subscription matcher helper
CREATE OR REPLACE FUNCTION public.subscription_matches_lead_v2(
    p_filters JSONB,
    p_lead_attributes JSONB,
    p_lead_created_at TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
    v_filters JSONB := COALESCE(p_filters, '{}'::jsonb);
    v_key TEXT;
    v_value TEXT;
    v_lead_date DATE := p_lead_created_at::DATE;
    v_start TEXT;
    v_end TEXT;
BEGIN
    IF (SELECT count(*) FROM jsonb_object_keys(v_filters)) = 0 THEN
        RETURN TRUE;
    END IF;

    FOR v_key, v_value IN
        SELECT key, value
        FROM jsonb_each_text(v_filters)
    LOOP
        IF v_key = 'city' THEN
            IF LOWER(COALESCE(p_lead_attributes->>'city', '')) <> LOWER(v_value) THEN
                RETURN FALSE;
            END IF;
        ELSIF v_key = 'region' THEN
            IF LOWER(COALESCE(p_lead_attributes->>'region', '')) <> LOWER(v_value) THEN
                RETURN FALSE;
            END IF;
        ELSIF v_key = 'brand' THEN
            IF LOWER(COALESCE(p_lead_attributes->>'brand', p_lead_attributes->>'make')) <> LOWER(v_value) THEN
                RETURN FALSE;
            END IF;
        ELSIF v_key = 'model' THEN
            IF LOWER(COALESCE(p_lead_attributes->>'model', '')) <> LOWER(v_value) THEN
                RETURN FALSE;
            END IF;
        ELSIF v_key = 'lead_type' OR v_key = 'leadType' THEN
            IF LOWER(COALESCE(p_lead_attributes->>'lead_type', p_lead_attributes->>'leadType')) <> LOWER(v_value) THEN
                RETURN FALSE;
            END IF;
        ELSIF v_key = 'date_range' OR v_key = 'dateRange' THEN
            IF LOWER(v_value) = 'today' THEN
                IF v_lead_date <> CURRENT_DATE THEN
                    RETURN FALSE;
                END IF;
            ELSIF LOWER(v_value) = 'last_7_days' THEN
                IF v_lead_date < CURRENT_DATE - INTERVAL '6 days' THEN
                    RETURN FALSE;
                END IF;
            ELSIF LOWER(v_value) = 'last_30_days' THEN
                IF v_lead_date < CURRENT_DATE - INTERVAL '29 days' THEN
                    RETURN FALSE;
                END IF;
            ELSIF POSITION('..' IN v_value) > 0 THEN
                v_start := SPLIT_PART(v_value, '..', 1);
                v_end := SPLIT_PART(v_value, '..', 2);
                IF (v_start <> '' AND v_lead_date < v_start::DATE)
                   OR (v_end <> '' AND v_lead_date > v_end::DATE) THEN
                    RETURN FALSE;
                END IF;
            END IF;
        ELSIF v_key = 'start_date' THEN
            IF v_lead_date < v_value::DATE THEN
                RETURN FALSE;
            END IF;
        ELSIF v_key = 'end_date' THEN
            IF v_lead_date > v_value::DATE THEN
                RETURN FALSE;
            END IF;
        END IF;
    END LOOP;

    RETURN TRUE;
END;
$$;

-- 10) Allocation orchestrator (real-time + quota-safe)
CREATE OR REPLACE FUNCTION public.allocate_new_lead_v2(
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
BEGIN
    FOR v_sub IN
        SELECT id, dealer_id, filters
        FROM public.dealer_subscriptions
        WHERE status = 'active'
          AND remaining_quota > 0
          AND (expires_at IS NULL OR expires_at >= NOW())
        ORDER BY created_at ASC
    LOOP
        IF public.subscription_matches_lead_v2(v_sub.filters, p_lead_attributes, p_lead_created_at) THEN
            SELECT public.allocate_lead_to_sub(p_lead_id, v_sub.id, v_sub.dealer_id)
            INTO v_alloc_success;

            IF v_alloc_success THEN
                v_allocated := v_allocated || jsonb_build_array(
                    jsonb_build_object(
                        'subscriptionId', v_sub.id,
                        'dealerId', v_sub.dealer_id
                    )
                );
            END IF;
        END IF;
    END LOOP;

    RETURN jsonb_build_object(
        'success', TRUE,
        'allocated', v_allocated,
        'count', jsonb_array_length(v_allocated)
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.calculate_subscription_price_v2(JSONB, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_subscription_v2(UUID, JSONB, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.allocate_new_lead_v2(UUID, JSONB, TIMESTAMPTZ) TO service_role;
