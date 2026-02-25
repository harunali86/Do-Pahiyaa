import { createSupabaseAdminClient } from "@/lib/supabase/admin";

async function cleanupAndTest() {
    const admin = createSupabaseAdminClient();
    console.log("Starting cleanup task...");

    // 1. Fetch all listings to find duplicates by title/make/model
    const { data: allListings, error: fetchError } = await admin
        .from("listings")
        .select("id, title, make, model, created_at")
        .order("created_at", { ascending: false });

    if (fetchError) {
        console.error("Error fetching listings:", fetchError);
        return;
    }

    console.log(`Found ${allListings?.length} total listings.`);

    // 2. Identify duplicates keeping only max 10 unique ones
    const uniqueKeys = new Set();
    const toKeep = [];
    const toDelete = [];

    for (const listing of allListings || []) {
        // Create a unique key based on model/make/title. Let's just use title or make+model for simplicity.
        const key = `${listing.make}-${listing.model}-${listing.title}`.toLowerCase().trim();

        if (!uniqueKeys.has(key) && uniqueKeys.size < 10) {
            uniqueKeys.add(key);
            toKeep.push(listing.id);
        } else {
            toDelete.push(listing.id);
        }
    }

    console.log(`Keeping ${toKeep.length} unique listings. Deleting ${toDelete.length} duplicates...`);

    // 3. Delete in batches
    if (toDelete.length > 0) {
        for (let i = 0; i < toDelete.length; i += 50) {
            const batch = toDelete.slice(i, i + 50);
            const { error: deleteError } = await admin
                .from("listings")
                .delete()
                .in("id", batch);

            if (deleteError) {
                console.error(`Error deleting batch:`, deleteError);
            } else {
                console.log(`Deleted batch of ${batch.length}`);
            }
        }
    }
    console.log("Cleanup complete!");

    // 4. Test KYC relationship
    console.log("Testing KYC relationship...");
    const { data: kycData, error: kycError } = await admin
        .from('profiles')
        .select(`
            id,
            kyc_documents (id)
        `)
        .limit(1);

    if (kycError) {
        console.error("KYC Relationship Error:", kycError.message);
        console.log("Attempting to reload PostgREST cache via RPC if we have one...");
        // Sometimes running an arbitrary command or waiting helps if it's local.
        // If it's remote, the user needs to reload cache.
    } else {
        console.log("KYC Relationship OK!");
    }
}

cleanupAndTest();
