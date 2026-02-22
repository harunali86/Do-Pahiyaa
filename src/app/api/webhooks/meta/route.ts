import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Handle GET requests for Webhook Verification
 * Meta Cloud API verification logic.
 */
export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");

        // Verify Token for Do-Pahiyaa WABA
        const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "dopahiyaa_webhook_secret";

        if (mode && token) {
            if (mode === "subscribe" && token === VERIFY_TOKEN) {
                console.log("✅ WABA Webhook Verified Succesfully");
                // The challenge must be returned as plain text
                return new Response(challenge, {
                    status: 200,
                    headers: { "Content-Type": "text/plain" },
                });
            }
            console.warn("❌ WABA Verification Failed: Token mismatch");
            return new NextResponse("Forbidden", { status: 403 });
        }
        return new NextResponse("Bad Request", { status: 400 });
    } catch (error) {
        console.error("WABA GET Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

/**
 * Handle POST requests for incoming Webhook events
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Log incoming event for debugging and audit
        console.log("📥 WABA Webhook Event:", JSON.stringify(body, null, 2));

        if (body.object === "whatsapp_business_account") {
            // TODO: Process messages, status updates, etc.

            // Mandatory acknowledgment
            return new NextResponse("EVENT_RECEIVED", { status: 200 });
        }

        return new NextResponse("Not Found", { status: 404 });
    } catch (error) {
        console.error("WABA POST Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
