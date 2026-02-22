const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdmin() {
    console.log('Checking for admin@gmail.com...');

    // 1. Get Authentication User
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const adminUser = users.find(u => u.email === 'admin@gmail.com');

    if (!adminUser) {
        console.log('User admin@gmail.com not found. Creating it...');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: 'admin@gmail.com',
            password: '12344567',
            email_confirm: true
        });

        if (createError) {
            console.error('Error creating user:', createError);
            return;
        }
        console.log('User created:', newUser.user.id);
        await upsertProfile(newUser.user.id);
    } else {
        console.log('User found:', adminUser.id);
        await upsertProfile(adminUser.id);
    }
}

async function upsertProfile(userId) {
    console.log(`Upserting profile for ${userId}...`);

    const { error } = await supabase.from('profiles').upsert({
        id: userId,
        email: 'admin@gmail.com',
        full_name: 'Super Admin',
        role: 'admin',
        is_verified: true
    });

    if (error) {
        console.error('Error upserting profile:', error);
    } else {
        console.log('Success! Profile ensure role is ADMIN.');
    }
}

fixAdmin();
