-- Distributed rate limit primitive for edge/runtime-safe throttling.
-- Used by src/proxy.ts when RATE_LIMIT_MODE=distributed.

CREATE TABLE IF NOT EXISTS public.rate_limit_counters (
    rate_key TEXT NOT NULL,
    window_start TIMESTAMPTZ NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (rate_key, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_expires ON public.rate_limit_counters (expires_at);

ALTER TABLE public.rate_limit_counters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No direct access to rate_limit_counters" ON public.rate_limit_counters;
CREATE POLICY "No direct access to rate_limit_counters"
ON public.rate_limit_counters
FOR ALL
USING (FALSE)
WITH CHECK (FALSE);

CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_key TEXT,
    p_limit INTEGER,
    p_window_seconds INTEGER DEFAULT 60
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_now TIMESTAMPTZ := NOW();
    v_window_start TIMESTAMPTZ;
    v_expires_at TIMESTAMPTZ;
    v_count INTEGER;
BEGIN
    IF p_key IS NULL OR p_key = '' THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Invalid rate key');
    END IF;

    IF p_limit <= 0 THEN
        RETURN jsonb_build_object('success', FALSE, 'message', 'Invalid limit');
    END IF;

    IF p_window_seconds <= 0 THEN
        p_window_seconds := 60;
    END IF;

    v_window_start := to_timestamp(
        floor(extract(epoch from v_now) / p_window_seconds) * p_window_seconds
    );
    v_expires_at := v_window_start + make_interval(secs => p_window_seconds);

    -- Probabilistic cleanup to keep table compact.
    IF random() < 0.05 THEN
        DELETE FROM public.rate_limit_counters WHERE expires_at < NOW();
    END IF;

    INSERT INTO public.rate_limit_counters (rate_key, window_start, request_count, expires_at)
    VALUES (p_key, v_window_start, 1, v_expires_at)
    ON CONFLICT (rate_key, window_start)
    DO UPDATE
      SET request_count = public.rate_limit_counters.request_count + 1,
          expires_at = EXCLUDED.expires_at
    RETURNING request_count INTO v_count;

    RETURN jsonb_build_object(
        'success', (v_count <= p_limit),
        'limit', p_limit,
        'remaining', GREATEST(0, p_limit - v_count),
        'reset', v_expires_at
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) TO anon, authenticated;
