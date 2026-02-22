-- CLEAN ADMIN ROLE HARMONIZATION & RLS OVERRIDE
-- 1) Fix Admin Role Helper Function
CREATE OR REPLACE FUNCTION public.is_admin_or_superadmin(p_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = p_user_id
      AND role::text IN ('admin', 'super_admin', 'super-admin')
  );
$function$;

-- 2) Grant Public Access to Helper
GRANT EXECUTE ON FUNCTION public.is_admin_or_superadmin(uuid) TO public;
GRANT EXECUTE ON FUNCTION public.is_admin_or_superadmin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_superadmin(uuid) TO service_role;

-- 3) Fix Leads RLS: Allow Admins to bypass unlock check and create leads
DROP POLICY IF EXISTS "Buyers Create Leads" ON public.leads;
CREATE POLICY "Buyers Create Leads" ON public.leads 
FOR INSERT 
TO authenticated 
WITH CHECK (
    (auth.uid() = buyer_id) AND (
        is_admin_or_superadmin(auth.uid()) OR -- ADMIN BYPASS
        EXISTS (
            SELECT 1 
            FROM public.buyer_unlocks 
            WHERE buyer_unlocks.buyer_id = auth.uid() 
            AND buyer_unlocks.listing_id = leads.listing_id
        )
    )
);

-- 4) Fix Leads RLS: Allow Admins to see all leads
DROP POLICY IF EXISTS "Admins View All Leads" ON public.leads;
CREATE POLICY "Admins View All Leads" ON public.leads 
FOR SELECT 
TO authenticated 
USING (is_admin_or_superadmin(auth.uid()));

-- 5) Final profile sync: Ensure super_admin role can't be deleted or changed at DB level if needed
-- (Not strictly necessary but good for security)

NOTIFY pgrst, 'reload schema';
