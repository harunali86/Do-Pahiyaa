import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
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

        // Security: Apply business-exception rate limiter for high-volume purchasing (60 req/min)
        const rateLimitResult = await rateLimit(req, 'purchase');
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: "Too many requests. Please slow down purchasing." },
                { status: 429, headers: { "Retry-After": rateLimitResult.reset?.toString() || "60" } }
            );
        }

        const body = await req.json();
        const validated = unlockLeadSchema.parse(body);
        const result = await LeadService.unlockLead(user.id, validated.leadId);

        return apiSuccess(result);
    } catch (error) {
        return handleApiError(error);
    }
}
