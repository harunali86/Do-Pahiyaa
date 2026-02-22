import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdmin() {
    console.log('Checking for dopahiyaa@gmail.com...');

    // 1. Get Authentication User
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const adminUser = users.find(u => u.email === 'dopahiyaa@gmail.com');

    if (!adminUser) {
        console.log('User dopahiyaa@gmail.com not found. Creating it...');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: 'dopahiyaa@gmail.com',
            password: '12344567', // Requesting 8 chars as per user
            email_confirm: true
        });

        if (createError) {
            console.error('Error creating user:', createError);
            return;
        }
        console.log('User created:', newUser.user?.id);

        // Profile might be created by trigger if it exists now, but let's upsert to be safe
        await upsertProfile(newUser.user!.id);
    } else {
        console.log('User found:', adminUser.id);
        await upsertProfile(adminUser.id);
    }
}

async function upsertProfile(userId: string) {
    console.log(`Upserting profile for ${userId}...`);

    const { error } = await supabase.from('profiles').upsert({
        id: userId,
        email: 'dopahiyaa@gmail.com',
        full_name: 'Super Admin',
        role: 'admin',
        is_verified: true
    });

    if (error) {
        console.error('Error upserting profile:', error);
    } else {
        console.log('Success! Profile ensures role is ADMIN.');
    }
}

fixAdmin();
