import { NextRequest } from "next/server";
import { ListingService } from "@/lib/services/listing.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const result = await ListingService.getListings({
            page: Number(searchParams.get("page")) || 1,
            limit: Number(searchParams.get("limit")) || 12,
            city: searchParams.get("city") || undefined,
            make: searchParams.get("make") || undefined,
            minPrice: Number(searchParams.get("minPrice")) || undefined,
            maxPrice: Number(searchParams.get("maxPrice")) || undefined,
        });

        return apiSuccess(result);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return apiError("Unauthorized", 401);

        const body = await req.json();
        const listing = await ListingService.createListing(user.id, body);

        return apiSuccess(listing, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
