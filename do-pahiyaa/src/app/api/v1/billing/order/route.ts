import { NextRequest } from "next/server";
import { PaymentService } from "@/lib/services/payment.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { z } from "zod";

const createOrderSchema = z.object({
    leadQuantity: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return apiError("Unauthorized", 401);

        const body = await req.json();
        const { leadQuantity } = createOrderSchema.parse(body);
        const order = await PaymentService.createOrder(user.id, leadQuantity);

        return apiSuccess({ order }, 201);
    } catch (error) {
        return handleApiError(error);
    }
}
