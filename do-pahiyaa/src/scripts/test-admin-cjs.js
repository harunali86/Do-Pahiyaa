
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    console.log("Running CJS Script...");

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.error("Missing ENV vars!");
        console.log("URL:", url);
        console.log("KEY Length:", key ? key.length : 0);
        return;
    }

    try {
        const admin = createClient(url, key, {
            auth: {
                persistSession: false,
                autoRefreshToken: false
            }
        });
        console.log("Client created.");

        // Test query on unlock_events
        console.log("Querying unlock_events...");
        const { data, error } = await admin.from('unlock_events').select('*').limit(1);

        if (error) {
            console.error("Query Error:", JSON.stringify(error, null, 2));
        } else {
            console.log("Query Success. Data:", data);
        }

    } catch (err) {
        console.error("Runtime Error:", err);
    }
}

main();
