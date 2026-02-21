-- RPC to aggregate revenue by month for the last 12 months
CREATE OR REPLACE FUNCTION public.admin_revenue_by_month()
RETURNS TABLE (name TEXT, revenue NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH months AS (
        SELECT to_char(date_trunc('month', (CURRENT_DATE - (m || ' months')::interval)), 'Mon') as month_name,
               date_trunc('month', (CURRENT_DATE - (m || ' months')::interval)) as month_date
        FROM generate_series(0, 11) m
    )
    SELECT 
        m.month_name as name,
        COALESCE(SUM(t.amount), 0)::NUMERIC as revenue
    FROM months m
    LEFT JOIN public.transactions t ON date_trunc('month', t.created_at) = m.month_date AND t.status = 'success'
    GROUP BY m.month_name, m.month_date
    ORDER BY m.month_date ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_revenue_by_month() TO service_role;
