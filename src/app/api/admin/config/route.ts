import { NextRequest } from "next/server";
import { ConfigService } from "@/lib/services/config.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { requireAdminAccess } from "@/lib/auth/authorization";
import { z } from "zod";

// GET: Fetch all config (admin dashboard)
export async function GET() {
    try {
        const supabase = await createSupabaseServerClient();
        const auth = await requireAdminAccess(supabase);
        if (!auth.ok) return apiError(auth.error, auth.status);

        const configs = await ConfigService.getAllConfig();
        return apiSuccess(configs);
    } catch (error) {
        return handleApiError(error);
    }
}

// PUT: Batch update configs (admin only)
const updateConfigSchema = z.object({
    updates: z.array(z.object({
        key: z.string(),
        value: z.string(),
    })).min(1),
});

export async function PUT(req: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const auth = await requireAdminAccess(supabase);
        if (!auth.ok) return apiError(auth.error, auth.status);

        const body = await req.json();
        const { updates } = updateConfigSchema.parse(body);

        await ConfigService.setConfigs(updates as any, auth.user.id);

        return apiSuccess({ updated: updates.length });
    } catch (error) {
        return handleApiError(error);
    }
}
