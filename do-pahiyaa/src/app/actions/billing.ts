"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PaymentService } from "@/lib/services/payment.service";
import { revalidatePath } from "next/cache";

export async function createOrderAction(leadQuantity: number) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const order = await PaymentService.createOrder(user.id, leadQuantity);
        return { success: true, order };
    } catch (error: any) {
        console.error("Create Order Error:", error);
        return { success: false, error: error.message || "Failed to create order" };
    }
}

export async function verifyPaymentAction(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const result = await PaymentService.verifyPayment(
            user.id,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        );

        revalidatePath("/dealer/credits");
        revalidatePath("/dealer/dashboard"); // Update sidebar balance

        return { success: true, newBalance: result.newBalance };
    } catch (error: any) {
        console.error("Payment Verification Error:", error);
        return { success: false, error: error.message || "Payment verification failed" };
    }
}
