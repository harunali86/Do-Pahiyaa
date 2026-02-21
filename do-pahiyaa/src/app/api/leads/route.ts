import { NextRequest } from "next/server";
import { LeadService } from "@/lib/services/lead.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { z } from "zod";

const createLeadSchema = z.object({
    listingId: z.string().uuid(),
    message: z.string().min(1, "Message is required").max(500),
});

export async function POST(req: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return apiError("Unauthorized. Please login to send an inquiry.", 401);

        const body = await req.json();
        const validated = createLeadSchema.parse(body);
        const lead = await LeadService.createInquiry(user.id, validated.listingId, validated.message);

        return apiSuccess(lead, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
