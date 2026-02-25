import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load dopahiyaa.env
const envPath = path.resolve(process.cwd(), 'dopahiyaa.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const dbUrl = envConfig.DATABASE_URL.replace('[YOUR_DB_PASSWORD]', 'Ruleonthebike1');

async function applyLedgers() {
    const client = new Client({ connectionString: dbUrl });
    try {
        await client.connect();
        console.log("✅ Connected to Database.");

        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'dealers';
        `);
        console.log("Dealers Schema:", res.rows);

        // Apply p2: Schema and RLS
        console.log("Applying Schema Migration (credits_ledger, usage_counters_monthly)...");
        const p2Sql = fs.readFileSync(path.resolve(process.cwd(), '../supabase/migrations/20260225_p2_financial_ledgers.sql'), 'utf8');
        await client.query(p2Sql);
        console.log("✅ Applied Schema Migration");

        // Apply p3: RPCs
        console.log("Applying RPC Migration (unlock_lead_v3, purchase_subscription_v3, admin_adjust_dealer_balance)...");
        const p3Sql = fs.readFileSync(path.resolve(process.cwd(), '../supabase/migrations/20260225_p3_financial_ledgers_rpcs.sql'), 'utf8');
        await client.query(p3Sql);
        console.log("✅ Applied RPC Migration");

        // Reload PostgREST Cache
        console.log("Reloading PostgREST cache...");
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log("✅ Cache Reloaded");

        console.log("🎉 Ledger Migrations Applied Successfully.");
    } catch (err: any) {
        console.error("❌ Ledger Migration Failed:", err.message);
    } finally {
        await client.end();
    }
}

applyLedgers();
