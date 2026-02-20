"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LeadService } from "@/lib/services/lead.service";
import { revalidatePath } from "next/cache";

export async function unlockLeadAction(leadId: string) {
    const supabase = await createSupabaseServerClient();

    // 1. Get Current User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // 2. Call Service
        const result = await LeadService.unlockLead(user.id, leadId);

        // 3. Revalidate
        revalidatePath("/dealer/leads");
        revalidatePath("/dealer/dashboard");

        return { success: true, creditsRemaining: result.creditsRemaining };
    } catch (error: any) {
        console.error("unlockLeadAction Error:", error);
        return { success: false, error: error.message || "Failed to unlock lead" };
    }
}
