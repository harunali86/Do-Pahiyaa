import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export class WhatsAppService {
    /**
     * Parse and route incoming Meta Webhook events for WhatsApp.
     */
    static async handleIncomingEvent(body: any) {
        if (!body.entry || !body.entry.length) return;

        for (const entry of body.entry) {
            for (const change of entry.changes) {
                const value = change.value;

                if (value.messages && value.messages.length > 0) {
                    await this.processMessages(value.messages, value.contacts, value.metadata);
                }

                if (value.statuses && value.statuses.length > 0) {
                    await this.processStatuses(value.statuses);
                }
            }
        }
    }

    /**
     * Send a template-based message via Meta WhatsApp Cloud API.
     */
    static async sendTemplate(phone: string, templateName: string, components: any[] = [], languageCode: string = "en_US") {
        const { WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID } = process.env;

        if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
            console.error("[WhatsApp] Credentials missing. Message not sent.");
            return false;
        }

        try {
            const response = await fetch(
                `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        messaging_product: "whatsapp",
                        to: phone,
                        type: "template",
                        template: {
                            name: templateName,
                            language: { code: languageCode },
                            components
                        }
                    })
                }
            );

            const result = await response.json();

            if (response.ok) {
                console.log(`[WhatsApp] Template '${templateName}' sent to ${phone}`);
                return true;
            } else {
                console.error(`[WhatsApp] Failed to send template:`, result);
                return false;
            }
        } catch (error) {
            console.error(`[WhatsApp] Network error sending template:`, error);
            return false;
        }
    }

    /**
     * Specific notification for Dealer when a lead is unlocked.
     */
    static async sendLeadUnlockNotification(phone: string, buyerName: string, bikeTitle: string) {
        const components = [
            {
                type: "body",
                parameters: [
                    { type: "text", text: buyerName },
                    { type: "text", text: bikeTitle }
                ]
            }
        ];
        return this.sendTemplate(phone, "lead_unlock_dealer", components);
    }

    /**
     * Specific notification for Buyer when a dealer unlocks their interest.
     */
    static async sendBuyerNotification(phone: string, dealerName: string, bikeTitle: string) {
        const components = [
            {
                type: "body",
                parameters: [
                    { type: "text", text: dealerName },
                    { type: "text", text: bikeTitle }
                ]
            }
        ];
        return this.sendTemplate(phone, "lead_unlock_buyer", components);
    }

    private static async processMessages(messages: any[], contacts: any[], metadata: any) {
        const admin = createSupabaseAdminClient();

        for (const message of messages) {
            const senderPhone = message.from;
            const messageId = message.id;
            const timestamp = new Date(parseInt(message.timestamp) * 1000);

            // Log raw incoming message payload for audit
            console.log(`[WhatsApp] Received message ${messageId} from ${senderPhone}`);

            let content = "";
            let type = message.type;

            if (type === "text") {
                content = message.text.body;
            } else if (type === "interactive") {
                // Button replies
                content = message.interactive.button_reply?.id || message.interactive.list_reply?.id;
            }

            // Record inbound interaction into the DB
            const { error } = await admin.from("whatsapp_interactions").insert({
                phone_number: senderPhone,
                message_id: messageId,
                message_type: type,
                content: content,
                direction: "inbound",
                status: "received",
                received_at: timestamp.toISOString()
            });

            if (error) {
                console.error(`[WhatsApp] Failed to log inbound message:`, error);
            }
        }
    }

    private static async processStatuses(statuses: any[]) {
        const admin = createSupabaseAdminClient();

        for (const status of statuses) {
            const messageId = status.id;
            const newStatus = status.status; // 'sent', 'delivered', 'read', 'failed'
            const timestamp = new Date(parseInt(status.timestamp) * 1000);

            console.log(`[WhatsApp] Message ${messageId} status update: ${newStatus}`);

            // Update existing interaction status
            const { error } = await admin.from("whatsapp_interactions")
                .update({ status: newStatus, updated_at: timestamp.toISOString() })
                .eq("message_id", messageId);

            if (error) {
                console.error(`[WhatsApp] Failed to update message status:`, error);
            }
        }
    }
}
