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

type UpdateListingInput = Partial<CreateListingInput> & {
    title?: string;
};

export async function updateListingAction(listingId: string, data: UpdateListingInput) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const payload: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (typeof data.title === "string") payload.title = data.title.trim();
        if (typeof data.make === "string") payload.make = data.make.trim();
        if (typeof data.model === "string") payload.model = data.model.trim();
        if (typeof data.city === "string") payload.city = data.city.trim();
        if (typeof data.description === "string") payload.description = data.description.trim();
        if (typeof data.price === "number" && Number.isFinite(data.price)) payload.price = data.price;
        if (typeof data.year === "number" && Number.isFinite(data.year)) payload.year = data.year;
        if (typeof data.kms_driven === "number" && Number.isFinite(data.kms_driven)) payload.kms_driven = data.kms_driven;
        if (Array.isArray(data.images)) payload.images = data.images;
        if (typeof data.specs === "object" && data.specs !== null) payload.specs = data.specs;

        const { error } = await supabase
            .from("listings")
            .update(payload)
            .eq("id", listingId)
            .eq("seller_id", user.id);

        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to update listing" };
    }
}
