import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PricingRulesClient } from "@/components/admin/pricing/PricingRulesClient";

export default async function PricingFormatPage() {
    const supabase = await createSupabaseServerClient();

    const [{ data: rules }, { data: config }, { data: bulkDiscounts }] = await Promise.all([
        supabase
            .from("pricing_rules")
            .select("*")
            .order("created_at", { ascending: false }),
        supabase
            .from("lead_pricing_config")
            .select("*")
            .limit(1)
            .maybeSingle(),
        supabase
            .from("pricing_bulk_discounts")
            .select("*")
            .order("priority", { ascending: false })
            .order("min_quantity", { ascending: false }),
    ]);

    return (
        <div className="p-6 md:p-8 space-y-6 w-full">
            <PricingRulesClient
                rules={rules || []}
                config={config || null}
                bulkDiscounts={bulkDiscounts || []}
            />
        </div>
    );
}
