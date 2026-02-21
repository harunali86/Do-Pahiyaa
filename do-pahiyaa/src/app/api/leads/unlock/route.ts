import { NextRequest } from "next/server";
import { LeadService } from "@/lib/services/lead.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { z } from "zod";

const unlockLeadSchema = z.object({
    leadId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return apiError("Unauthorized", 401);

        const body = await req.json();
        const validated = unlockLeadSchema.parse(body);
        const result = await LeadService.unlockLead(user.id, validated.leadId);

        return apiSuccess(result);
    } catch (error) {
        return handleApiError(error);
    }
}
