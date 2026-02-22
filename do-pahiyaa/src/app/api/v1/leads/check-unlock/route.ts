import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const listingId = searchParams.get("listingId");

        if (!listingId) return apiError("Listing ID is required", 400);

        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return apiSuccess({ unlocked: false });

        const { data, error } = await supabase
            .from("buyer_unlocks")
            .select("id")
            .eq("buyer_id", user.id)
            .eq("listing_id", listingId)
            .maybeSingle();

        if (error) throw error;

        return apiSuccess({ unlocked: !!data });
    } catch (error: any) {
        console.error("[CheckUnlock] Error:", error);
        return apiError(error.message, 500);
    }
}
