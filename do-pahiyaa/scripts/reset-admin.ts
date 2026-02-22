import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load dopahiyaa.env
const envPath = path.resolve(process.cwd(), 'dopahiyaa.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetAdmin() {
    console.log('Resetting Admin Password...');

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const targetEmails = ['dopahiyaa@gmail.com', 'dopahiyaa@gmail.com'];

    for (const email of targetEmails) {
        const adminUser = users.find(u => u.email === email);
        if (adminUser) {
            console.log(`User ${email} found: ${adminUser.id}. Updating password...`);
            const { error: updateError } = await supabase.auth.admin.updateUserById(adminUser.id, {
                password: 'Bikespanindia@2026!'
            });
            if (updateError) {
                console.error(`Error updating password for ${email}:`, updateError);
            } else {
                console.log(`Successfully updated password for ${email}.`);

                // Ensure profile is admin
                const { error: profileError } = await supabase.from('profiles').upsert({
                    id: adminUser.id,
                    email: email,
                    role: 'super_admin',
                    is_verified: true
                });
                if (profileError) {
                    console.error('Error upserting profile:', profileError);
                } else {
                    console.log(`Profile role set to super_admin for ${email}.`);
                }
            }
        } else {
            console.log(`User ${email} not found.`);
        }
    }
}

resetAdmin();
