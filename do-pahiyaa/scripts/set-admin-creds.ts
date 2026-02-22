import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: './dopahiyaa.env' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setAdminCredentials() {
    const adminEmail = 'dopahiyaa@gmail.com';
    const adminPassword = 'Bikespanindia@2026!';

    console.log(`Setting up Admin...`);

    // 1. Check if user exists in auth.users
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    let user = users.users.find(u => u.email === adminEmail);

    if (!user) {
        // 2. Create the user
        console.log(`Creating new user: ${adminEmail}`);
        const { data: authData, error: createError } = await supabase.auth.admin.createUser({
            email: adminEmail,
            password: adminPassword,
            email_confirm: true
        });

        if (createError) {
            console.error("Failed to create user:", createError);
            return;
        }
        user = authData.user;

        // Also create the profile
        const { error: profileError } = await supabase.from('profiles').insert({
            id: user.id,
            email: adminEmail,
            role: 'super_admin',
            full_name: 'System Admin'
        });

        if (profileError) {
            console.log("Failed to insert profile record:", profileError);
        } else {
            console.log("Profile created successfully!");
        }

    } else {
        // 3. Update the password for existing user
        console.log(`User exists. Updating password...`);
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            user.id,
            { password: adminPassword }
        );

        if (updateError) {
            console.error("Failed to update password:", updateError);
            return;
        }

        // Ensure role is super_admin in profiles table
        const { error: roleError } = await supabase.from('profiles').update({
            role: 'super_admin'
        }).eq('id', user.id);

        if (roleError) {
            console.log("Failed to modify role record:", roleError);
        }
    }

    console.log(`✅ Admin credentials set successfully!`);
}

setAdminCredentials();
