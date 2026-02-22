
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkDealer() {
    try {
        console.log("Checking dealers...");
        // 1. Get all dealers
        const { data: dealers, error } = await supabase.from("dealers").select("*");
        if (error) {
            console.error("Error fetching dealers:", error);
        } else {
            console.log("Dealers found:", dealers?.length);
            if (dealers && dealers.length > 0) {
                console.log("Sample Dealer:", dealers[0]);
            } else {
                console.log("No dealers found in the table.");
            }
        }

        // 2. Check current config
        console.log("Checking config...");
        const { data: config, error: configError } = await supabase.from("platform_config").select("*").eq("key", "lead_unlock_price").single();
        if (configError) {
            console.error("Error fetching config:", configError);
        } else {
            console.log("Current Unlock Price Config:", config);
        }
    } catch (e) {
        console.error("Unexpected error:", e);
    } finally {
        console.log("Done.");
        process.exit(0);
    }
}

checkDealer();
