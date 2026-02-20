import Razorpay from "razorpay";
import crypto from "crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

const razorpay = env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET,
    })
    : null;

export class BillingService {
    /**
     * Create a Razorpay Order for credits purchase.
     */
    static async createCreditsOrder(dealerId: string, credits: number, amount: number) {
        if (!razorpay) {
            console.error("Razorpay is not configured.");
            throw new Error("Payment system is currently unavailable (Demo Mode).");
        }
        // 1. Create Order with Razorpay
        const options = {
            amount: amount * 100, // amount in paise
            currency: "INR",
            receipt: `rcpt_${Date.now()}_${dealerId.slice(0, 5)}`,
            notes: {
                dealerId: dealerId,
                type: "credits_topup",
                credits: credits
            }
        };

        try {
            const order = await razorpay.orders.create(options);
            return order;
        } catch (error) {
            console.error("Razorpay Order Creation Failed:", error);
            throw new Error("Failed to correct payment order.");
        }
    }

    /**
     * Verify payment signature and add credits to dealer account.
     */
    static async verifyPayment(paymentDetails: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        dealerId: string;
        credits: number;
    }) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dealerId, credits } = paymentDetails;

        // 1. Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            throw new Error("Invalid payment signature");
        }

        // 2. Add Credits to Dealer (Idempotent check recommended in production via webhook, doing inline for MVP)
        const supabase = await createSupabaseServerClient();

        // Fetch current credits to ensure atomic increment (or use RPC)
        // For MVP, simplistic update:
        const { data: dealer, error: fetchError } = await supabase
            .from("dealers")
            .select("credits_balance")
            .eq("profile_id", dealerId)
            .single();

        if (fetchError || !dealer) throw new Error("Dealer not found");

        const { error: updateError } = await supabase
            .from("dealers")
            .update({
                credits_balance: dealer.credits_balance + credits,
                // store transaction log if we had a table for it
            })
            .eq("profile_id", dealerId);

        if (updateError) throw new Error("Failed to update credits");

        return { success: true, newBalance: dealer.credits_balance + credits };
    }
}
