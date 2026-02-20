import { NextRequest } from "next/server";
import { BillingService } from "@/lib/services/billing.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { z } from "zod";

const verifyPaymentSchema = z.object({
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string(),
    credits: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return apiError("Unauthorized", 401);

        const body = await req.json();
        const details = verifyPaymentSchema.parse(body);

        const result = await BillingService.verifyPayment({
            ...details,
            dealerId: user.id,
        });

        return apiSuccess(result);
    } catch (error) {
        return handleApiError(error);
    }
}
