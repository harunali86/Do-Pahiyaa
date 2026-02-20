import { ConfigService } from "./config.service";

/**
 * Service to handle WhatsApp Cloud API integration.
 * Sends template messages for notifications (Unlock, Welcome, etc.)
 */
export class WhatsAppService {
    private static readonly API_URL = "https://graph.facebook.com/v18.0";

    /**
     * Send a template message to a user.
     */
    static async sendTemplate(to: string, templateName: string, components: any[] = []) {
        const token = process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (!token || !phoneId) {
            console.warn("WhatsApp credentials missing. Skipping notification.");
            return;
        }

        // Format phone number (remove +, spaces, ensure 91 prefix if needed)
        const formattedTo = to.replace(/\D/g, "");

        try {
            const response = await fetch(`${this.API_URL}/${phoneId}/messages`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: formattedTo,
                    type: "template",
                    template: {
                        name: templateName,
                        language: { code: "en" },
                        components: components,
                    },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("WhatsApp Send Error:", data);
                return false;
            }

            return true;
        } catch (error) {
            console.error("WhatsApp Service Error:", error);
            return false;
        }
    }

    /**
     * Notify dealer about a new lead unlock (or purchase confirmation).
     */
    static async sendLeadUnlockNotification(dealerPhone: string, leadName: string, bikeModel: string) {
        // Template: lead_unlocked_v1 (assumed name)
        // Body: "You have unlocked contact details for {{1}} interested in {{2}}."
        await this.sendTemplate(dealerPhone, "lead_unlocked_v1", [
            {
                type: "body",
                parameters: [
                    { type: "text", text: leadName },
                    { type: "text", text: bikeModel },
                ],
            },
        ]);
    }

    /**
     * Notify buyer that a dealer has unlocked their contact.
     */
    static async sendBuyerNotification(buyerPhone: string, dealerName: string, bikeModel: string) {
        // Template: buyer_contact_unlocked (assumed name)
        // Body: "Hi! {{1}} has shown interest in your {{2}} and may contact you soon."
        await this.sendTemplate(buyerPhone, "buyer_contact_unlocked", [
            {
                type: "body",
                parameters: [
                    { type: "text", text: dealerName },
                    { type: "text", text: bikeModel },
                ],
            },
        ]);
    }
}
