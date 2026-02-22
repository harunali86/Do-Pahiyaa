/**
 * WhatsApp Business API (WABA) Service
 * Handles all WhatsApp Cloud API operations: verification, messaging, OTP.
 */

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN ?? "dopahiyaa_webhook_secret";
const WABA_API_URL = "https://graph.facebook.com/v19.0";
const WABA_PHONE_NUMBER_ID = process.env.WABA_PHONE_NUMBER_ID ?? "";
const WABA_ACCESS_TOKEN = process.env.WABA_ACCESS_TOKEN ?? "";

// ─── Webhook Verification ─────────────────────────────────────────────────────

export function verifyWebhook(mode: string | null, token: string | null, challenge: string | null) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("[WABA] ✅ Webhook verified");
        return { verified: true, challenge };
    }
    console.warn("[WABA] ❌ Webhook verification failed. Token mismatch.");
    return { verified: false, challenge: null };
}

// ─── Webhook Event Handler ────────────────────────────────────────────────────

export function processWebhookEvent(body: Record<string, unknown>) {
    if (body.object !== "whatsapp_business_account") {
        return { handled: false };
    }

    // TODO: Parse and route message types (text, reply, status updates)
    console.log("[WABA] 📥 Event received:", JSON.stringify(body, null, 2));
    return { handled: true };
}

// ─── OTP / Template Messaging ─────────────────────────────────────────────────

export interface SendOtpOptions {
    to: string;        // e.g. "919876543210"
    otp: string;       // 6-digit OTP
    templateName?: string;
    languageCode?: string;
}

export async function sendOtpWhatsApp({ to, otp, templateName = "dopahiyaa_otp", languageCode = "en" }: SendOtpOptions) {
    const payload = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
            name: templateName,
            language: { code: languageCode },
            components: [
                {
                    type: "body",
                    parameters: [{ type: "text", text: otp }],
                },
                {
                    type: "button",
                    sub_type: "url",
                    index: "0",
                    parameters: [{ type: "text", text: otp }],
                },
            ],
        },
    };

    const res = await fetch(`${WABA_API_URL}/${WABA_PHONE_NUMBER_ID}/messages`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${WABA_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const error = await res.json();
        console.error("[WABA] ❌ OTP send failed:", error);
        throw new Error(`WABA OTP failed: ${JSON.stringify(error)}`);
    }

    const data = await res.json();
    console.log("[WABA] ✅ OTP sent:", data);
    return data;
}
