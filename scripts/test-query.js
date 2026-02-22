require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
    console.log("Testing query...");
    const { data, error } = await supabase
        .from('profiles')
        .select(`
            *,
            dealers!left (credits_balance)
        `)
        .limit(5);

    if (error) {
        console.error("Error:", JSON.stringify(error, null, 2));
    } else {
        console.log("Success:", data.length, "rows");
        if (data.length > 0) console.log("Sample:", JSON.stringify(data[0], null, 2));
    }
}

test();
