import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load dopahiyaa.env
const envPath = path.resolve(process.cwd(), 'dopahiyaa.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const dbUrl = envConfig.DATABASE_URL.replace('[YOUR_DB_PASSWORD]', 'Ruleonthebike1');

async function harden() {
    const client = new Client({ connectionString: dbUrl });
    try {
        await client.connect();
        console.log("✅ Connected to Database.");

        // 0. Ensure 'super_admin' role exists in enum
        console.log("Checking user_role enum...");
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'super_admin') THEN
                    ALTER TYPE public.user_role ADD VALUE 'super_admin';
                END IF;
            END$$;
        `);

        // 1. Create buyer_unlocks table
        console.log("Applying buyer_unlocks migration...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.buyer_unlocks (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
                listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
                payment_id TEXT NOT NULL,
                amount_paid NUMERIC(10, 2) DEFAULT 49.00,
                created_at TIMESTAMPTZ DEFAULT now(),
                UNIQUE(buyer_id, listing_id)
            );

            ALTER TABLE public.buyer_unlocks ENABLE ROW LEVEL SECURITY;

            DROP POLICY IF EXISTS "Buyers can view their own unlocks" ON public.buyer_unlocks;
            CREATE POLICY "Buyers can view their own unlocks" 
            ON public.buyer_unlocks FOR SELECT 
            USING (auth.uid() = buyer_id);

            DROP POLICY IF EXISTS "Admins can view all buyer unlocks" ON public.buyer_unlocks;
            CREATE POLICY "Admins can view all buyer unlocks"
            ON public.buyer_unlocks FOR SELECT
            USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')));
        `);

        // 2. Fix leads RLS (Buyers Create Leads)
        console.log("Fixing leads RLS...");
        await client.query(`
            DROP POLICY IF EXISTS "Buyers Create Leads" ON public.leads;
            CREATE POLICY "Buyers Create Leads" 
            ON public.leads FOR INSERT 
            WITH CHECK (
                auth.uid() = buyer_id 
                AND EXISTS (
                    SELECT 1 FROM public.buyer_unlocks 
                    WHERE buyer_id = auth.uid() AND listing_id = leads.listing_id
                )
            );
        `);

        // 3. Reload PostgREST Cache
        console.log("Reloading PostgREST cache...");
        await client.query("NOTIFY pgrst, 'reload schema';");

        // 4. Reset Admin Password
        console.log("Setting Admin Password for dopahiyaa@gmail.com...");
        // Since we can't easily hash the password here for Supabase Auth, 
        // we'll rely on the create-admin-acc.ts script using the admin client.

        console.log("🎉 Hardening Sync Complete.");
    } catch (err: any) {
        console.error("❌ Hardening Failed:", err.message);
    } finally {
        await client.end();
    }
}

harden();
