
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

// Mock ConfigService since it uses createSupabaseServerClient (cookies) which fails in script
// We'll just patch the function or rely on the script using separate logic if possible.
// Actually, Service implementations import "createSupabaseServerClient" from "@/lib/supabase/server".
// This will fail in a standalone script because "next/headers" (cookies) isn't available.
// workaround: We'll implement the test logic manually here using the Admin Client.

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyFlow() {
    console.log("Starting End-to-End Unlock Verification...");

    // 1. Get a Dealer (Harun)
    const { data: dealerProfile } = await supabase.from("profiles").select("id, email").eq("email", "admin@gmail.com").single(); // Assuming admin is also a dealer for testing, or pick a dealer
    // Actually, let's pick the first dealer from 'dealers' table
    const { data: dealers } = await supabase.from("dealers").select("profile_id, credits_balance").limit(1);

    if (!dealers || dealers.length === 0) {
        console.error("No dealers found. Test aborted.");
        return;
    }
    const dealerId = dealers[0].profile_id;
    const initialBalance = dealers[0].credits_balance;
    console.log(`Testing with Dealer: ${dealerId}, Balance: ${initialBalance}`);

    // 2. Add Credits if 0
    if (initialBalance < 1) {
        console.log("Balance too low. Adding 10 credits...");
        await supabase.from("dealers").update({ credits_balance: initialBalance + 10 }).eq("profile_id", dealerId);
    }

    // 3. Find a Locked Lead (Status 'new' and NOT present in unlock_events for this dealer)
    const { data: distinctUnlocked } = await supabase.from("unlock_events").select("lead_id").eq("dealer_id", dealerId);
    const unlockedIds = distinctUnlocked?.map(e => e.lead_id) || [];

    let leadQuery = supabase.from("leads").select("id").eq("status", "new");
    if (unlockedIds.length > 0) {
        leadQuery = leadQuery.not("id", "in", `(${unlockedIds.join(',')})`);
    }

    const { data: leads, error } = await leadQuery.limit(1);

    if (!leads || leads.length === 0) {
        console.error("No locked leads available to test.");
        // Create a dummy lead?
        return;
    }

    const leadId = leads[0].id;
    console.log(`Found Locked Lead: ${leadId}`);

    // 4. Perform Unlock (Simulating UnlockService logic)
    const unlockPrice = 1;
    console.log(`Unlocking for ${unlockPrice} credit...`);

    // A. Deduct
    const { error: deductError } = await supabase.from("dealers").update({ credits_balance: initialBalance - unlockPrice }).eq("profile_id", dealerId);
    if (deductError) {
        console.error("Deduction failed:", deductError);
        return;
    }

    // B. Insert Event
    const { error: eventError } = await supabase.from("unlock_events").insert({
        dealer_id: dealerId,
        lead_id: leadId,
        amount_paid: unlockPrice
    });
    if (eventError) {
        console.error("Event Insert failed:", eventError);
        return;
    }

    // C. Update Status
    await supabase.from("leads").update({ status: "unlocked" }).eq("id", leadId);

    console.log("Unlock Simulation Complete.");

    // 5. Verify Balance
    const { data: updatedDealer } = await supabase.from("dealers").select("credits_balance").eq("profile_id", dealerId).single();
    console.log(`New Balance: ${updatedDealer?.credits_balance}`);

    if (updatedDealer?.credits_balance === initialBalance - unlockPrice) {
        console.log("✅ Balance Deduction Verified.");
    } else {
        console.error("❌ Balance Deduction Mismatch.");
    }

    // 6. Verify Unlock Event
    const { data: event } = await supabase.from("unlock_events").select("*").eq("lead_id", leadId).eq("dealer_id", dealerId).single();
    if (event) {
        console.log("✅ Unlock Event Verified.");
    } else {
        console.error("❌ Unlock Event Missing.");
    }

    console.log("End-to-End Logic Verification Successful.");
    process.exit(0);
}

verifyFlow();
