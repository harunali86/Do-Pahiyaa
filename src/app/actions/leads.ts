"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateLeadStatusAction(leadId: string, status: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    try {
        // Verify entitlement (Dealer must have unlocked this lead)
        const { data: unlock, error: unlockError } = await supabase
            .from("unlock_events")
            .select("id")
            .eq("lead_id", leadId)
            .eq("dealer_id", user.id)
            .single();

        if (unlockError || !unlock) {
            return { success: false, error: "You do not have permission to update this lead." };
        }

        // Update status
        const { error } = await supabase
            .from("leads")
            .update({ status })
            .eq("id", leadId);

        if (error) throw error;

        revalidatePath("/dealer/leads");
        return { success: true };
    } catch (error: any) {
        console.error("Update status error:", error);
        return { success: false, error: error.message };
    }
}
