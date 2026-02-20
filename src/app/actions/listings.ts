"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ListingService } from "@/lib/services/listing.service";
import { listingSchema } from "@/lib/validations/schema";
import { z } from "zod";

type CreateListingInput = z.infer<typeof listingSchema>;

export async function createListingAction(data: CreateListingInput) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const listing = await ListingService.createListing(user.id, data);
        return { success: true, listingId: listing.id };
    } catch (error: any) {
        console.error("Create listing error:", error);
        return { success: false, error: error.message };
    }
}


export async function publishListingAction(listingId: string) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try {
        const { error } = await supabase
            .from("listings")
            .update({ status: "published" })
            .eq("id", listingId)
            .eq("seller_id", user.id);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
