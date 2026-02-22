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
            throw new Error("Failed to create payment order.");
        }
    }

    /**
     * Create a Razorpay Order for ₹49 Buyer-to-Seller contact unlock.
     */
    static async createBuyerUnlockOrder(buyerId: string, listingId: string) {
        if (!razorpay) {
            console.error("Razorpay is not configured.");
            throw new Error("Payment system is currently unavailable (Demo Mode).");
        }

        const options = {
            amount: 4900, // ₹49 in paise
            currency: "INR",
            receipt: `unlock_${buyerId.slice(0, 5)}_${listingId.slice(0, 5)}`,
            notes: {
                buyerId,
                listingId,
                type: "buyer_unlock"
            }
        };

        try {
            const order = await razorpay.orders.create(options);
            return order;
        } catch (error) {
            console.error("Razorpay Order Creation Failed:", error);
            throw new Error("Failed to create unlock order.");
        }
    }

    /**
     * Verify ₹49 payment and record the unlock for the buyer.
     */
    static async verifyBuyerUnlock(paymentDetails: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        buyerId: string;
        listingId: string;
    }) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, buyerId, listingId } = paymentDetails;

        // 1. Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            throw new Error("Invalid payment signature");
        }

        // 2. Record Unlock in DB
        const supabase = await createSupabaseServerClient();
        const { error } = await supabase
            .from("buyer_unlocks")
            .insert({
                buyer_id: buyerId,
                listing_id: listingId,
                payment_id: razorpay_payment_id,
                amount_paid: 49.00
            });

        if (error) {
            if (error.code === "23505") return { success: true, message: "Already unlocked" };
            throw new Error(`Failed to record unlock: ${error.message}`);
        }

        return { success: true };
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
            .createHmac("sha256", env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            throw new Error("Invalid payment signature");
        }

        // 2. Add Credits to Dealer
        const supabase = await createSupabaseServerClient();

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
            })
            .eq("profile_id", dealerId);

        if (updateError) throw new Error("Failed to update credits");

        return { success: true, newBalance: dealer.credits_balance + credits };
    }
}
