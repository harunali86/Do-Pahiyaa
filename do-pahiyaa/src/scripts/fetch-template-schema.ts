import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function getTemplateDetails() {
    const WABA_ID = "1296817568979652"; // From screenshot (the one with the card)
    const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

    console.log(`🔍 Fetching templates for WABA: ${WABA_ID}`);

    try {
        const response = await fetch(
            `https://graph.facebook.com/v21.0/${WABA_ID}/message_templates?name=dopahiyaa_otp`,
            {
                headers: {
                    "Authorization": `Bearer ${ACCESS_TOKEN}`
                }
            }
        );

        const data = await response.json();
        console.log("📄 Meta Template Schema:");
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("❌ Failed to fetch template:", error);
    }
}

getTemplateDetails();
