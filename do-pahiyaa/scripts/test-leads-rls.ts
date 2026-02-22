import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    // 1. authenticate using an existing buyer account or just check the setup
    const email = 'dopahiyaa@gmail.com';
    const password = 'DopahiyaaAdmin@2026!';

    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { console.error(error); return; }
    
    // Attempt an insert without actual listing if possible (we might fail foreign key, but let's check RLS first)
    const { data, error: insertError } = await supabase.from('leads').insert({
        listing_id: '00000000-0000-0000-0000-000000000000',
        buyer_id: authData.user.id,
        message: 'Test'
    });
    console.log("Insert result:", insertError || data);
}
check();
