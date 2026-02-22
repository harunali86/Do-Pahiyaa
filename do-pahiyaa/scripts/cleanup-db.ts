import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: './dopahiyaa.env' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function cleanup() {
    console.log("--- FINAL DATABASE AUDIT START ---");

    // 1. Get all profiles
    const { data: profiles } = await supabase.from('profiles').select('id, email, role');

    // 2. Clear super_admin and admin roles from EVERYONE except dopahiyaa@gmail.com
    console.log("Ensuring dopahiyaa@gmail.com is the ONLY super_admin...");

    const targets = profiles?.filter(p => p.email !== 'dopahiyaa@gmail.com' && (p.role === 'super_admin' || p.role === 'admin')) || [];

    for (const target of targets) {
        console.log(`Demoting ${target.email} from ${target.role} to 'user'...`);
        // Rename if it's the specific mock admin
        const newEmail = target.email === 'dopahiyaa@gmail.com' ? `mock_admin_old_${Date.now()}@mock.local` : target.email;

        await supabase.from('profiles').update({
            role: 'user',
            email: newEmail
        }).eq('id', target.id);

        // Also update the email in auth.users if it was renamed
        if (newEmail !== target.email) {
            await supabase.auth.admin.updateUserById(target.id, { email: newEmail });
        }
    }

    // 3. Force dopahiyaa@gmail.com to be super_admin
    const { data: dopahiyaa } = await supabase.from('profiles').select('id').eq('email', 'dopahiyaa@gmail.com').single();
    if (dopahiyaa) {
        await supabase.from('profiles').update({ role: 'super_admin' }).eq('id', dopahiyaa.id);
        console.log("✅ Verified: dopahiyaa@gmail.com is now the ONLY super_admin.");
    }

    // 4. Final Verification
    const { data: finalProfiles } = await supabase.from('profiles').select('email, role').eq('role', 'super_admin');
    console.log("Active Super Admins:", finalProfiles);
}

cleanup();
