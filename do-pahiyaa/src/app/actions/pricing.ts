"use server";

import { PricingService } from "@/lib/services/pricing.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function calculateDynamicPrice(payload: any) {
    try {
        const data = await PricingService.calculatePrice(payload || {});
        return data;
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function purchaseFilterPack(filters: any, quota: number, expectedCost: number) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, message: "Unauthorized" };

    try {
        const result = await PricingService.purchaseSubscription(
            user.id,
            {
                ...(filters || {}),
                quantity: quota,
                useFilters: filters ? Object.keys(filters).length > 0 : false,
            },
            expectedCost
        );
        return result;
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
