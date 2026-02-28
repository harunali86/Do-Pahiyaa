import { WhatsAppService } from "../lib/services/whatsapp.service";
import dotenv from "dotenv";
import path from "path";

// Load env from the root or .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testConnection() {
    const phone = "918329320708"; // The verified number from your screenshot
    console.log(`🚀 Testing WABA connection for: ${phone}`);
    console.log(`📍 Phone ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID}`);

    // We'll try to send a template message
    try {
        const result = await WhatsAppService.sendTemplate(phone, "dopahiyaa_otp", [
            {
                type: "body",
                parameters: [{ type: "text", text: "123456" }]
            },
            {
                type: "button",
                sub_type: "url",
                index: "0",
                parameters: [{ type: "text", text: "123456" }]
            }
        ], "en");

        console.log("✅ API Response:", JSON.stringify(result, null, 2));
    } catch (error: any) {
        console.error("❌ Connection failed:");
        if (error.response) {
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

testConnection();
