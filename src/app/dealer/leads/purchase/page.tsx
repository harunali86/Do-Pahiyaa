import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PurchaseLeadsClient } from "@/components/dealer/PurchaseLeadsClient";
import { redirect } from "next/navigation";

export default async function PurchaseLeadsPage() {
    const supabase = await createSupabaseServerClient();

    // 1. Get Current User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    // 2. Get Dealer Profile (for Credits)
    const { data: dealer } = await supabase
        .from("dealers")
        .select("credits_balance")
        .eq("profile_id", user.id)
        .single();

    if (!dealer) redirect("/onboarding/dealer"); // Or handle error

    // 3. Get Available Options from live inventory + pricing rules
    const [
        { data: cities },
        { data: brands },
        { data: models },
        { data: regionRows },
        { data: leadTypeRules },
        { data: dateRangeRules },
    ] = await Promise.all([
        supabase.from("listings").select("city"),
        supabase.from("listings").select("make"),
        supabase.from("listings").select("model"),
        supabase.from("city_region_map").select("region").eq("is_active", true),
        supabase
            .from("pricing_rules")
            .select("condition_value")
            .eq("condition_type", "lead_type")
            .eq("is_active", true),
        supabase
            .from("pricing_rules")
            .select("condition_value")
            .eq("condition_type", "date_range")
            .eq("is_active", true),
    ]);

    // Unique and Sort
    const uniqueCities = Array.from(new Set(cities?.map(c => c.city).filter(Boolean))).sort() as string[];
    const uniqueBrands = Array.from(new Set(brands?.map(b => b.make).filter(Boolean))).sort() as string[];
    const uniqueModels = Array.from(new Set(models?.map(m => m.model).filter(Boolean))).sort() as string[];
    const uniqueRegions = Array.from(new Set(regionRows?.map(r => r.region).filter(Boolean))).sort() as string[];
    const leadTypeOptions = Array.from(new Set([
        "buy_used",
        ...(leadTypeRules?.map(r => r.condition_value).filter(Boolean) || [])
    ])).sort() as string[];
    const dateRangeOptions = Array.from(new Set([
        "today",
        "last_7_days",
        "last_30_days",
        ...(dateRangeRules?.map(r => r.condition_value).filter(Boolean) || [])
    ])).sort() as string[];

    return (
        <div className="p-6 md:p-8 space-y-6 w-full max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white">Purchase Lead Packs</h1>
                <p className="text-slate-400">Subscribe to specific lead types to get priority access.</p>
            </div>

            <PurchaseLeadsClient
                availableCities={uniqueCities}
                availableBrands={uniqueBrands}
                availableModels={uniqueModels}
                availableRegions={uniqueRegions}
                availableLeadTypes={leadTypeOptions}
                availableDateRanges={dateRangeOptions}
                currentCredits={dealer?.credits_balance || 0}
            />
        </div>
    );
}
