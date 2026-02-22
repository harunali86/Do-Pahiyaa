import { createSupabaseAdminClient } from '../lib/supabase/admin';

async function createTestListing() {
    const admin = createSupabaseAdminClient();

    // Get an existing dealer profile to use as seller
    const { data: dealer } = await admin.from('dealers').select('profile_id').limit(1).single();

    if (!dealer) {
        console.error("No dealer found to act as seller.");
        return;
    }

    const { data, error } = await admin.from('listings').insert({
        seller_id: dealer.profile_id,
        title: "Test Royal Enfield Interceptor 650",
        make: "Royal Enfield",
        model: "Interceptor 650",
        year: 2023,
        price: 320000,
        city: "Pune",
        status: "draft", // This will show up in moderation
        description: "Mint condition test bike for moderation verification.",
        images: ["https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=60"]
    }).select();

    if (error) {
        console.error("Error creating test listing:", error);
    } else {
        console.log("Test listing created for moderation:", data);
    }
}

createTestListing();
