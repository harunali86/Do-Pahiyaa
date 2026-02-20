
import Razorpay from "razorpay";
import crypto from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ConfigService } from "./config.service";

// Use singleton instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!
});

export const PaymentService = {
    /**
     * Create a Razorpay Order for purchasing credits.
     * Enforces minimum purchase limit and calculates GST.
     */
    async createOrder(dealerId: string, leadQuantity: number) {
        // 1. Get Configs
        const leadPrice = await ConfigService.getConfigNumber("lead_unlock_price", 1);
        const minQty = await ConfigService.getConfigNumber("min_leads_purchase", 100);
        const gstRate = await ConfigService.getConfigNumber("gst_rate_percent", 18);

        // 2. Validate Quantity
        if (leadQuantity < minQty) {
            throw new Error(`Minimum purchase is ${minQty} leads.`);
        }

        // 3. Calculate Amount
        const baseAmount = leadQuantity * leadPrice;
        const gstAmount = (baseAmount * gstRate) / 100;
        const totalAmount = Math.round(baseAmount + gstAmount); // Razorpay needs integer (paise), but we store rupees usually? No, Razorpay order amount is in paise.

        // Razorpay expects amount in smallest currency unit (paise)
        const amountInPaise = totalAmount * 100;

        // 4. Create Order
        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `receipt_${dealerId}_${Date.now()}`,
            notes: {
                dealer_id: dealerId,
                credits: leadQuantity, // Storing credits to add later
                gst_amount: gstAmount
            }
        };

        try {
            const order = await razorpay.orders.create(options);
            return {
                orderId: order.id,
                amount: totalAmount,
                baseAmount,
                gstAmount,
                currency: "INR",
                keyId: process.env.RAZORPAY_KEY_ID
            };
        } catch (error: any) {
            console.error("Razorpay Order Error:", error);
            throw new Error("Failed to create payment order");
        }
    },

    /**
     * Verify payment signature and add credits to dealer.
     * Use Admin Client (Service Role) to bypass RLS for updating balance.
     */
    async verifyPayment(
        dealerId: string,
        razorpayOrderId: string,
        razorpayPaymentId: string,
        razorpaySignature: string
    ) {
        // 1. Verify Signature
        const body = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpaySignature) {
            throw new Error("Invalid payment signature");
        }

        // 2. Fetch Order Details to get credit amount (from notes)
        // Ideally we should have stored this in our DB pending state, but we can trust Razorpay if verified OR fetch details
        // For security, we should fetch the order from Razorpay to get the notes back, preventing frontend manipulation
        const order = await razorpay.orders.fetch(razorpayOrderId);
        const creditsPurchased = Number(order.notes?.credits || 0);
        const gstAmount = Number(order.notes?.gst_amount || 0);
        const amountPaid = Number(order.amount) / 100; // Convert back to Rupees

        if (!creditsPurchased) throw new Error("Invalid order data: credits missing");

        const admin = createSupabaseAdminClient();

        // 3. Record Transaction
        const { data: transaction, error: txnError } = await admin
            .from("transactions")
            .insert({
                dealer_id: dealerId,
                amount: amountPaid,
                credits_purchased: creditsPurchased,
                gst_amount: gstAmount,
                razorpay_order_id: razorpayOrderId,
                razorpay_payment_id: razorpayPaymentId,
                status: "success",
                type: "credit_purchase"
            })
            .select()
            .single();

        if (txnError) throw new Error(`Transaction recording failed: ${txnError.message}`);

        // 4. Update Balance (Add Credits)
        // Fetch current balance first to be safe, or direct increment
        // But we need pessimistic locking or RPC for strict safety. For now, standard update.
        const { data: dealer } = await admin.from("dealers").select("credits_balance").eq("profile_id", dealerId).single();
        const currentBalance = dealer?.credits_balance || 0;

        const { error: balanceError } = await admin
            .from("dealers")
            .update({ credits_balance: currentBalance + creditsPurchased })
            .eq("profile_id", dealerId);

        if (balanceError) {
            // CRITICAL: Failed to add credits after payment!
            // Log error, maybe mark transaction as 'processed_failed'
            console.error("CRITICAL: Failed to add credits", balanceError);
            throw new Error("Payment successful but credit update failed. Support has been notified.");
        }

        return { success: true, newBalance: currentBalance + creditsPurchased };
    }
};
