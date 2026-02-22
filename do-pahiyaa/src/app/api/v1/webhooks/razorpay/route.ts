import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get("x-razorpay-signature");

        if (!signature) {
            return NextResponse.json({ error: "Missing signature" }, { status: 400 });
        }

        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) {
            console.error("RAZORPAY_WEBHOOK_SECRET is not set");
            return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
        }

        // Verify Signature
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex");

        if (expectedSignature !== signature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        const event = JSON.parse(body);

        // Handle Payment Captured or Order Paid
        if (event.event === "payment.captured" || event.event === "order.paid") {
            const payment = event.payload.payment.entity;
            const orderId = payment.order_id; // critical for idempotency

            const admin = createSupabaseAdminClient();

            // 1. Idempotency Check: Does this transaction already exist?
            const { data: existingTxn } = await admin
                .from("transactions")
                .select("id, status")
                .eq("razorpay_order_id", orderId)
                .maybeSingle();

            if (existingTxn && existingTxn.status === 'success') {
                console.log(`[Webhook] Transaction ${orderId} already processed.`);
                return NextResponse.json({ status: "ok", message: "Already processed" });
            }

            // 2. Extract Metadata from Notes
            const notes = payment.notes || {};
            const dealerId = notes.dealer_id || notes.dealerId;
            const creditsToAdd = parseInt(notes.credits || "0");
            const gstAmount = parseFloat(notes.gst_amount || "0");

            if (dealerId && creditsToAdd > 0) {
                // 3. Record Transaction and Update Credits Atomically via RPC
                const { data: rpcResult, error: rpcError } = await admin.rpc(
                    "process_razorpay_credit_purchase",
                    {
                        p_dealer_id: dealerId,
                        p_amount: Number(payment.amount) / 100,
                        p_credits: creditsToAdd,
                        p_gst: gstAmount,
                        p_order_id: orderId,
                        p_payment_id: payment.id
                    }
                );

                if (rpcError) {
                    console.error("CRITICAL: Credits update failed via webhook RPC", rpcError);
                    return NextResponse.json({ error: "Credit Update Failed", details: rpcError.message }, { status: 500 });
                }

                console.log(`[Webhook] Successfully ran transactional credit purchase for ${dealerId}. Result:`, rpcResult);
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("Webhook processing failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
