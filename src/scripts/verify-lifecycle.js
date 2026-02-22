const { Client } = require('pg');
const dotenv = require('dotenv');

// Load .env.local
dotenv.config({ path: '.env.local' });

// IDs from Seed Script (assuming consistency or handled dynamically if possible)
// But wait, the seed script used specific IDs if possible?
// The seed script generated random IDs for listings? No, it used a fixed Dealer ID.
// Listings were inserted with auto-generated IDs.
// I need A Listing ID to test inquiries.
// I will fetch the most recent listing.

const DEALER_ID = '00000000-0000-0000-0000-000000000001';
const BUYER_ID = '00000000-0000-0000-0000-000000000002'; // Pseudo Buyer ID for simulation

async function verifyLifecycle() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ DATABASE_URL is missing in .env.local');
        process.exit(1);
    }

    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('🧪 Starting Lifecycle Verification...');

        // 1. Fetch a Listing
        const resListing = await client.query(`SELECT id, title, seller_id FROM public.listings WHERE status = 'published' LIMIT 1`);
        if (resListing.rows.length === 0) {
            throw new Error("No listings found! Run seed script first.");
        }
        const listing = resListing.rows[0];
        console.log(`✅ Found Listing: "${listing.title}" (ID: ${listing.id})`);

        // 3. Create a Buyer Profile (if not exists)
        // We need a buyer profile to send an inquiry.
        // We'll insert into auth.users (mock) and profiles.
        await client.query(`
            INSERT INTO auth.users (id, email, role, aud) 
            VALUES ('${BUYER_ID}', 'buyer@test.com', 'authenticated', 'authenticated')
            ON CONFLICT (id) DO NOTHING;
        `);
        await client.query(`
            INSERT INTO public.profiles (id, email, full_name, role)
            VALUES ('${BUYER_ID}', 'buyer@test.com', 'Test Buyer', 'user')
            ON CONFLICT (id) DO NOTHING;
        `);
        console.log(`✅ Ensure Buyer Profile: ${BUYER_ID}`);

        // 3. Simulate Inquiry (Buyer -> Lead)
        // Check if lead exists first
        const existingLead = await client.query(`SELECT id FROM public.leads WHERE listing_id = $1 AND buyer_id = $2`, [listing.id, BUYER_ID]);
        if (existingLead.rows.length > 0) {
            console.log("ℹ️ Lead already exists, deleting for fresh test...");
            await client.query(`DELETE FROM public.leads WHERE id = $1`, [existingLead.rows[0].id]);
        }

        const resLead = await client.query(`
            INSERT INTO public.leads (listing_id, buyer_id, message, status)
            VALUES ($1, $2, 'Is this bike still available?', 'new')
            RETURNING id, status
        `, [listing.id, BUYER_ID]);
        const lead = resLead.rows[0];
        console.log(`✅ Created Inquiry (Lead ID: ${lead.id}, Status: ${lead.status})`);

        // 4. Verify Dealer Can See It (Simulation)
        // Query as if we are the dealer (just checking database view)
        const dealerLeads = await client.query(`
             SELECT l.id, l.status FROM public.leads l
             JOIN public.listings lst ON l.listing_id = lst.id
             WHERE lst.seller_id = $1 AND l.id = $2
        `, [DEALER_ID, lead.id]);

        if (dealerLeads.rows.length === 0) {
            throw new Error("Dealer cannot see the lead! Check link between listing and dealer.");
        }
        console.log(`✅ Dealer Dashboard: Lead is visible.`);

        // 5. Unlock Lead (Dealer Action)
        // Check credits
        const dealerRes = await client.query(`SELECT credits_balance FROM public.dealers WHERE profile_id = $1`, [DEALER_ID]);
        const startCredits = dealerRes.rows[0].credits_balance;
        console.log(`ℹ️ Dealer Credits Before: ${startCredits}`);

        if (startCredits < 1) {
            throw new Error("Not enough credits to test unlock!");
        }

        // Perform Unlock (Transaction Simulation)
        await client.query('BEGIN');

        await client.query(`UPDATE public.dealers SET credits_balance = credits_balance - 1 WHERE profile_id = $1`, [DEALER_ID]);
        await client.query(`INSERT INTO public.unlock_events (lead_id, dealer_id, cost_credits) VALUES ($1, $2, 1)`, [lead.id, DEALER_ID]);
        await client.query(`UPDATE public.leads SET status = 'unlocked' WHERE id = $1`, [lead.id]);

        await client.query('COMMIT');
        console.log(`✅ Lead Unlocked successfully.`);

        // 6. Verify Final State
        const finalLead = await client.query(`SELECT status FROM public.leads WHERE id = $1`, [lead.id]);
        const finalDealer = await client.query(`SELECT credits_balance FROM public.dealers WHERE profile_id = $1`, [DEALER_ID]);

        console.log(`POST-TEST STATUS:`);
        console.log(`- Lead Status: ${finalLead.rows[0].status} (Expected: unlocked)`);
        console.log(`- Dealer Credits: ${finalDealer.rows[0].credits_balance} (Expected: ${startCredits - 1})`);

        if (finalLead.rows[0].status === 'unlocked' && finalDealer.rows[0].credits_balance === startCredits - 1) {
            console.log(`🎉 VERIFICATION SUCCESSFUL! The Full Lead Lifecycle works.`);
        } else {
            console.error(`❌ Verification Mismatch!`);
        }

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Verification Failed:', err);
    } finally {
        await client.end();
    }
}

verifyLifecycle();
