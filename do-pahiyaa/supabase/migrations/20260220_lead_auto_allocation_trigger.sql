-- Real-time auto-allocation trigger for pre-purchased lead subscriptions.
-- Ensures every newly created lead is routed to matching active subscriptions.

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

    PERFORM public.allocate_new_lead_v2(
        NEW.id,
        v_payload,
        COALESCE(NEW.created_at, now())
    );

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Never block lead creation if allocation fails.
        RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_allocate_lead ON public.leads;

CREATE TRIGGER trg_auto_allocate_lead
AFTER INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.auto_allocate_lead_on_insert();

