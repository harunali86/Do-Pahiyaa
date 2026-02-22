import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Try loading env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials in environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
    const email = 'dopahiyaa@gmail.com';
    const password = 'Bikespanindia@2026!';

    console.log(`Creating admin user: ${email}...`);

    // 1. Create or update user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { role: 'admin', full_name: 'Harun Admin' }
    });

    let userId;

    if (authError) {
        if (authError.message.includes('already exists')) {
            console.log("User already exists in Auth. Fetching ID to update profile.");
            const { data: usersData } = await supabase.auth.admin.listUsers();
            const existingUser = usersData.users.find(u => u.email === email);
            if (existingUser) {
                userId = existingUser.id;
                // Optional: Update password if needed
                await supabase.auth.admin.updateUserById(userId, { password });
                console.log("Password reset to default for existing user.");
            } else {
                console.error("Could not find existing user.");
                return;
            }
        } else {
            console.error('Error creating auth user:', authError.message);
            return;
        }
    } else {
        userId = authData.user.id;
    }

    console.log(`User ID: ${userId}`);

    // 2. Upsert profile in public.profiles
    const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        email: email,
        full_name: 'Dopahiyaa Admin',
        role: 'admin',
        status: 'active'
    });

    if (profileError) {
        console.error('Error creating profile:', profileError.message);
        return;
    }

    console.log('✅ Admin account successfully created and profile updated.');
}

createAdmin();
