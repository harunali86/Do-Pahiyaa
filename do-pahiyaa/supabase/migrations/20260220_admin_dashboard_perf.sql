-- Admin dashboard performance optimization
-- Avoid loading all transaction rows just to compute total revenue.

CREATE OR REPLACE FUNCTION public.admin_total_revenue()
RETURNS NUMERIC
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(SUM(amount), 0)::NUMERIC
    FROM public.transactions
    WHERE status = 'success';
$$;

GRANT EXECUTE ON FUNCTION public.admin_total_revenue() TO service_role;
