import { NextRequest, NextResponse } from "next/server";

// The verify token we configure in Meta Dashboard
const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "dopahiyaa_webhook_secret";

/**
 * Handle GET requests for Webhook Verification
 * Meta will send a GET request to verify the webhook URL.
 */
export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");

        // Check if mode and token are present
        if (mode && token) {
            if (mode === "subscribe" && token === VERIFY_TOKEN) {
                console.log("✅ Webhook verified successfully!");
                // Respond with the challenge to verify
                // Must return text/plain for the challenge
                return new NextResponse(challenge, {
                    status: 200,
                    headers: { "Content-Type": "text/plain" },
                });
            }

            console.warn("❌ Webhook verification failed. Token mismatch.");
            // Respond with 403 Forbidden if verify tokens do not match
            return new NextResponse("Forbidden", { status: 403 });
        }

        return new NextResponse("Bad Request", { status: 400 });
    } catch (error) {
        console.error("Error verifying webhook:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

/**
 * Handle POST requests for incoming Webhook events
 * Meta will send POST requests when messages are received or statuses change.
 */
export async function POST(req: NextRequest) {
    try {
        // Attempt to parse the incoming JSON payload
        let body;
        try {
            body = await req.json();
        } catch {
            return new NextResponse("Invalid JSON", { status: 400 });
        }

        console.log("📥 Incoming Webhook Event:", JSON.stringify(body, null, 2));

        // Verify it's a WhatsApp API event
        if (body.object === "whatsapp_business_account") {
            // TODO: Add logic here to process messages, update statuses in DB, etc.
            // E.g., handling incoming messages, read receipts, delivery statuses.

            // Acknowledge receipt of the webhook to Meta
            return new NextResponse("EVENT_RECEIVED", { status: 200 });
        }

        // Return a '404 Not Found' if event is not from a WhatsApp API
        return new NextResponse("Not Found", { status: 404 });
    } catch (error) {
        console.error("Error processing webhook POST payload:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
