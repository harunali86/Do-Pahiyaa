import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listingSchema } from "@/lib/validations/schema";
import { z } from "zod";

type CreateListingDTO = z.infer<typeof listingSchema>;

// Select only needed columns to avoid over-fetching (GEMINI.md Rule 3.1)
const LISTING_CARD_SELECT = `
    id, title, make, model, year, price, kms_driven, city, images, status, 
    is_company_listing, specs, created_at,
    seller:profiles(full_name, avatar_url, is_verified)
`;

const LISTING_DETAIL_SELECT = `
    id, title, make, model, year, price, kms_driven, city, description, 
    specs, images, status, is_company_listing, created_at, updated_at,
    seller:profiles(id, full_name, avatar_url, is_verified, phone, role)
`;

export class ListingService {
    /**
     * Create a new listing for a verified seller.
     */
    static async createListing(userId: string, data: CreateListingDTO) {
        const supabase = await createSupabaseServerClient();
        const validated = listingSchema.parse(data);

        const { data: listing, error } = await supabase
            .from("listings")
            .insert({
                seller_id: userId,
                title: validated.title,
                price: validated.price,
                make: validated.make,
                model: validated.model,
                year: validated.year,
                kms_driven: validated.kms_driven,
                city: validated.city,
                description: validated.description,
                status: "published",
                specs: validated.specs || {},
                images: validated.images || [],
                updated_at: new Date().toISOString(),
            })
            .select("id, title, status, created_at")
            .single();

        if (error) throw new Error(`Listing creation failed: ${error.message}`);
        return listing;
    }

    /**
     * Fetch listings with filters and pagination.
     * Uses partial indexes on (status='published') for speed.
     */
    static async getListings(params: {
        page?: number;
        limit?: number;
        city?: string;
        make?: string;
        minPrice?: number;
        maxPrice?: number;
        isCompany?: boolean;
    }) {
        const supabase = await createSupabaseServerClient();
        const page = params.page || 1;
        const limit = Math.min(params.limit || 12, 100); // Max 100 per GEMINI.md Rule 4.2
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from("listings")
            .select(LISTING_CARD_SELECT, { count: "exact" })
            .eq("status", "published")
            .order("created_at", { ascending: false })
            .range(from, to);

        if (params.city) query = query.ilike("city", `%${params.city}%`);
        if (params.make) query = query.eq("make", params.make);
        if (params.minPrice) query = query.gte("price", params.minPrice);
        if (params.maxPrice) query = query.lte("price", params.maxPrice);
        if (params.isCompany !== undefined) query = query.eq("is_company_listing", params.isCompany);

        const { data, error, count } = await query;

        if (error) throw new Error(`Fetch listings failed: ${error.message}`);

        return {
            listings: data || [],
            metadata: {
                total: count || 0,
                page,
                totalPages: Math.ceil((count || 0) / limit),
            },
        };
    }

    /**
     * Get a single listing with seller info (lean select).
     */
    static async getListingById(id: string) {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("listings")
            .select(LISTING_DETAIL_SELECT)
            .eq("id", id)
            .single();

        if (error) throw new Error("Listing not found");
        return data;
    }

    /**
     * Fetch ALL listings for a specific seller (Dashboard view).
     * Includes Draft, Sold, Archived, etc.
     */
    static async getDealerListings(userId: string) {
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("listings")
            .select(LISTING_CARD_SELECT)
            .eq("seller_id", userId)
            .order("updated_at", { ascending: false });

        if (error) throw new Error(`Fetch dealer listings failed: ${error.message}`);
        return data || [];
    }

    static async deleteListing(id: string, userId: string) {
        const supabase = await createSupabaseServerClient();
        const { error } = await supabase
            .from("listings")
            .delete()
            .eq("id", id)
            .eq("seller_id", userId);

        if (error) throw new Error("Delete failed: " + error.message);
        return true;
    }

    /**
     * Get unique makes and cities for search filters.
     * Cached for 1 hour in production.
     */
    static async getFilterOptions() {
        const supabase = await createSupabaseServerClient();

        const [makesResult, citiesResult] = await Promise.all([
            supabase.from("listings").select("make").eq("status", "published"),
            supabase.from("listings").select("city").eq("status", "published"),
        ]);

        const makes = Array.from(new Set((makesResult.data || []).map(l => l.make))).filter(Boolean).sort();
        const cities = Array.from(new Set((citiesResult.data || []).map(l => l.city))).filter(Boolean).sort();

        return { makes, cities };
    }
}
