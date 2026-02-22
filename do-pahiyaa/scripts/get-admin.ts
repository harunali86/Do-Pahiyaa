import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: './dopahiyaa.env' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkAdmin() {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('role', 'super_admin')
        .limit(1);

    if (error) console.error('Error fetching admin:', error);
    else console.log('Admin User:', data);
}

checkAdmin();
