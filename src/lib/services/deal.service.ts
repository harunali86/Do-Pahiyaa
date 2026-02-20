import { createSupabaseServerClient } from "@/lib/supabase/server";

export class DealService {
    /**
     * Create an offer on a listing.
     * Prevents multiple active offers from same buyer on same listing.
     */
    static async createOffer(buyerId: string, listingId: string, amount: number, message?: string) {
        const supabase = await createSupabaseServerClient();

        // Check for existing pending offer
        const { data: existing } = await supabase
            .from("offers")
            .select("id")
            .eq("listing_id", listingId)
            .eq("buyer_id", buyerId)
            .eq("status", "pending")
            .maybeSingle();

        if (existing) throw new Error("You already have a pending offer on this bike.");

        const { data, error } = await supabase
            .from("offers")
            .insert({
                listing_id: listingId,
                buyer_id: buyerId,
                amount,
                message,
                status: "pending"
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    /**
     * Get offers received by a seller.
     */
    static async getSellerOffers(sellerId: string) {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from("offers")
            .select(`
                *,
                buyer:profiles!buyer_id(id, full_name, email),
                listing:listings!inner(id, title, price, seller_id)
            `)
            .eq("listing.seller_id", sellerId)
            .order("created_at", { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    }

    /**
     * Accept an offer and create a Deal entry.
     */
    static async acceptOffer(offerId: string, sellerId: string) {
        const supabase = await createSupabaseServerClient();

        // 1. Verify ownership and get offer details
        const { data: offer, error: offerError } = await supabase
            .from("offers")
            .select("*, listing:listings(id, seller_id)")
            .eq("id", offerId)
            .single();

        if (offerError || !offer) throw new Error("Offer not found");
        if (offer.listing.seller_id !== sellerId) throw new Error("Unauthorized");

        // 2. Start Transaction (JS-level for now)
        // A. Update Offer Status
        await supabase.from("offers").update({ status: "accepted" }).eq("id", offerId);

        // B. Reject all other offers for this listing
        await supabase.from("offers")
            .update({ status: "rejected" })
            .eq("listing_id", offer.listing.id)
            .neq("id", offerId)
            .eq("status", "pending");

        // C. Create Deal
        const { data: deal, error: dealError } = await supabase
            .from("deals")
            .insert({
                offer_id: offerId,
                buyer_id: offer.buyer_id,
                listing_id: offer.listing.id,
                status: "contact_locked"
            })
            .select()
            .single();

        if (dealError) throw new Error(`Deal creation failed: ${dealError.message}`);
        return deal;
    }

    static async getDealById(id: string) {
        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from("deals")
            .select(`
                *,
                offer:offers(*),
                listing:listings(*),
                buyer:profiles!buyer_id(*)
            `)
            .eq("id", id)
            .single();

        if (error) throw new Error("Deal not found");
        return data;
    }
}
