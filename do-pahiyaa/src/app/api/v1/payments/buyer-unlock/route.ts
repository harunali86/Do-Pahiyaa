import { NextRequest } from "next/server";
import { BillingService } from "@/lib/services/billing.service";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiSuccess, apiError } from "@/lib/api-response";
import { z } from "zod";

const createOrderSchema = z.object({
    listingId: z.string().uuid(),
    action: z.enum(["create", "verify"]),
    paymentDetails: z.object({
        razorpay_order_id: z.string(),
        razorpay_payment_id: z.string(),
        razorpay_signature: z.string(),
    }).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return apiError("Unauthorized", 401);

        const body = await req.json();
        const { listingId, action, paymentDetails } = createOrderSchema.parse(body);

        if (action === "create") {
            const order = await BillingService.createBuyerUnlockOrder(user.id, listingId);
            return apiSuccess(order);
        } else if (action === "verify") {
            if (!paymentDetails) return apiError("Payment details missing", 400);

            const result = await BillingService.verifyBuyerUnlock({
                ...paymentDetails,
                buyerId: user.id,
                listingId
            });

            return apiSuccess(result);
        }

        return apiError("Invalid action", 400);
    } catch (error: any) {
        console.error("[BuyerUnlockAPI] Error:", error);
        return apiError(error.message, 500);
    }
}
