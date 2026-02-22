
import Razorpay from "razorpay";
import crypto from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ConfigService } from "./config.service";

// Initialize Razorpay with environment variables
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    })
    : null;

export const PaymentService = {
    /**
     * Create a Razorpay Order for purchasing credits.
     * Enforces minimum purchase limit and calculates GST.
     */
    async createOrder(dealerId: string, leadQuantity: number) {
        if (!razorpay) {
            console.error("Payment system error: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing");
            throw new Error("Payment system is currently unavailable. Please contact support.");
        }

        // 1. Get Configs
        const leadPrice = await ConfigService.getConfigNumber("lead_unlock_price", 250); // Default adjusted to semi-realistic value
        const minQty = await ConfigService.getConfigNumber("min_leads_purchase", 100);
        const gstRate = await ConfigService.getConfigNumber("gst_rate_percent", 18);

        // 2. Validate Quantity
        if (leadQuantity < minQty) {
            throw new Error(`Minimum purchase is ${minQty} leads.`);
        }

        // 3. Calculate Amount
        const baseAmount = leadQuantity * leadPrice;
        const gstAmount = (baseAmount * gstRate) / 100;
        const totalAmount = Math.round(baseAmount + gstAmount);

        // Razorpay expects amount in smallest currency unit (paise)
        const amountInPaise = totalAmount * 100;

        // 4. Create Order
        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `rcpt_${Date.now()}_${dealerId.slice(0, 5)}`,
            notes: {
                dealer_id: dealerId,
                credits: leadQuantity.toString(),
                gst_amount: gstAmount.toString(),
                base_amount: baseAmount.toString()
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
            console.error("[PaymentService] Order Creation Error:", error);
            throw new Error("Failed to create payment order. Please try again.");
        }
    },

    /**
     * Verify payment signature and record successful transaction atomically.
     * Uses hardened database RPC for atomicity and idempotency.
     */
    async verifyPayment(
        dealerId: string,
        razorpayOrderId: string,
        razorpayPaymentId: string,
        razorpaySignature: string
    ) {
        if (!process.env.RAZORPAY_KEY_SECRET) {
            throw new Error("Server configuration error: Key Secret missing");
        }

        // 1. Verify Signature
        const body = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpaySignature) {
            console.error("[PaymentService] Signature Mismatch", { razorpayOrderId, razorpayPaymentId });
            throw new Error("Invalid payment signature. Verification failed.");
        }

        // 2. Fetch Order Details from Razorpay (Source of Truth)
        // This prevents trust-client-side-metadata issues.
        if (!razorpay) throw new Error("Payment system unavailable");
        
        const order = await razorpay.orders.fetch(razorpayOrderId);
        const credits = parseInt(order.notes?.credits as string || "0");
        const gst = parseFloat(order.notes?.gst_amount as string || "0");
        const amountPaid = Number(order.amount) / 100;

        if (!credits || credits <= 0) {
            throw new Error("Invalid order data: Credits count is zero or missing.");
        }

        // 3. Execute Hardened RPC for Atomicity
        const admin = createSupabaseAdminClient();
        const { data, error } = await admin.rpc("handle_credit_purchase", {
            p_dealer_id: dealerId,
            p_amount: amountPaid,
            p_credits: credits,
            p_gst: gst,
            p_order_id: razorpayOrderId,
            p_payment_id: razorpayPaymentId
        });

        if (error || !data.success) {
            console.error("[PaymentService] RPC Error:", error || data?.message);
            throw new Error(data?.message || "Transaction failed to persist. Please contact support with Order ID.");
        }

        console.log(`[PaymentService] Payment verified and credits added: ${credits} for ${dealerId}`, {
            is_duplicate: data.is_duplicate,
            order_id: razorpayOrderId
        });

        return { 
            success: true, 
            newBalance: data.new_balance,
            isDuplicate: data.is_duplicate 
        };
    },

    /**
     * Re-verify a payment from a webhook event.
     * Logic is shared with verifyPayment but uses the payment entity directly.
     */
    async processWebhookPayment(payment: any) {
        const orderId = payment.order_id;
        const dealerId = payment.notes?.dealer_id;
        const credits = parseInt(payment.notes?.credits || "0");
        const gst = parseFloat(payment.notes?.gst_amount || "0");
        const amountPaid = Number(payment.amount) / 100;

        if (!dealerId || !credits || !orderId) {
            console.error("[PaymentWebhook] Incomplete data in payment entity", { orderId, dealerId, credits });
            return { success: false, message: "Incomplete payment data" };
        }

        const admin = createSupabaseAdminClient();
        const { data, error } = await admin.rpc("handle_credit_purchase", {
            p_dealer_id: dealerId,
            p_amount: amountPaid,
            p_credits: credits,
            p_gst: gst,
            p_order_id: orderId,
            p_payment_id: payment.id
        });

        if (error || !data.success) {
            console.error("[PaymentWebhook] RPC Error:", error || data?.message);
            return { success: false, message: data?.message || "Internal failure" };
        }

        return { success: true, isDuplicate: data.is_duplicate };
    }
};
