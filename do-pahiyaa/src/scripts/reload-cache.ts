import { Client } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixDB() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("DATABASE_URL missing.");
        process.exit(1);
    }

    const client = new Client({ connectionString });
    await client.connect();

    try {
        // 1. Reload schema cache for PostgREST (Fixes OTP requests table issue)
        console.log("NOTIFY pgrst, 'reload schema'...");
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log("Schema cache reloaded.");

        // 2. Ensure the Leads policy is absolutely correct and has no issues
        console.log("Fixing leads RLS policy...");
        await client.query(`
            DROP POLICY IF EXISTS "Buyers Create Leads" ON public.leads;
            
            -- We just grant INSERT to authenticated users, since they are making their own leads
            CREATE POLICY "Buyers Create Leads" 
            ON public.leads FOR INSERT 
            WITH CHECK (auth.uid() = buyer_id);
            
            -- Make sure the SELECT policy is solid
            DROP POLICY IF EXISTS "Buyers View Own Leads" ON public.leads;
            CREATE POLICY "Buyers View Own Leads"
            ON public.leads FOR SELECT
            USING (auth.uid() = buyer_id);
            
            -- Just in case there was a conflict on update
            DROP POLICY IF EXISTS "Buyers Update Own Leads" ON public.leads;
            CREATE POLICY "Buyers Update Own Leads"
            ON public.leads FOR UPDATE
            USING (auth.uid() = buyer_id);
            
            -- Ensure Admin policy
            DROP POLICY IF EXISTS "Admin View All Leads" ON public.leads;
            CREATE POLICY "Admin View All Leads" ON public.leads FOR SELECT USING (
              EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin' OR role = 'super_admin')
            );
        `);
        console.log("Leads RLS fixed.");

        // 3. Let's make sure the OTP requests table is accessible
        console.log("Fixing auth_otp_requests RLS policy...");
        await client.query(`
            DROP POLICY IF EXISTS "Public can insert OTP requests" ON public.auth_otp_requests;
            CREATE POLICY "Public can insert OTP requests" ON public.auth_otp_requests FOR INSERT WITH CHECK (true);
            
            DROP POLICY IF EXISTS "Public can select OTP requests" ON public.auth_otp_requests;
            CREATE POLICY "Public can select OTP requests" ON public.auth_otp_requests FOR SELECT USING (true);
        `);
        console.log("OTP RLS fixed.");

        console.log("Done.");
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.end();
    }
}

fixDB();
