import { NextRequest } from "next/server";
import { PaymentService } from "@/lib/services/payment.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";
import { z } from "zod";

const verifyPaymentSchema = z.object({
    razorpay_order_id: z.string(),
    razorpay_payment_id: z.string(),
    razorpay_signature: z.string(),
});

export async function POST(req: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return apiError("Unauthorized", 401);

        const body = await req.json();
        const details = verifyPaymentSchema.parse(body);

        const result = await PaymentService.verifyPayment(
            user.id,
            details.razorpay_order_id,
            details.razorpay_payment_id,
            details.razorpay_signature
        );

        return apiSuccess(result);
    } catch (error) {
        return handleApiError(error);
    }
}
