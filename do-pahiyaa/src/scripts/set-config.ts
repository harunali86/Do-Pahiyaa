
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setConfig() {
    console.log("Updating Platform Config...");

    const updates = [
        { key: "lead_unlock_price", value: "1", label: "Lead Unlock Price (₹)", category: "pricing" },
        { key: "min_leads_purchase", value: "100", label: "Minimum Leads Purchase (Qty)", category: "billing" },
        { key: "gst_rate_percent", value: "18", label: "GST Rate (%)", category: "billing" }
    ];

    for (const update of updates) {
        const { error } = await supabase.from("platform_config").upsert({
            key: update.key,
            value: update.value,
            label: update.label,
            category: update.category,
            updated_at: new Date().toISOString()
        }, { onConflict: "key" });

        if (error) console.error(`Failed to update ${update.key}:`, error);
        else console.log(`Set ${update.key} = ${update.value}`);
    }

    console.log("Config Update Complete.");
    process.exit(0);
}

setConfig();
