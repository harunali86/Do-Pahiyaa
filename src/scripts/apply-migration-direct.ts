
import { Client } from "pg";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Construct Connection String for Supabase
// Usually postgres://postgres:password@db.project.supabase.co:5432/postgres
// Since running locally: process.env.DATABASE_URL usually expected.
// If local supabase: postgresql://postgres:postgres@127.0.0.1:54322/postgres
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

async function applyMigration() {
    console.log("Connecting to database...", connectionString);
    const client = new Client({ connectionString });
    await client.connect();

    try {
        console.log("Applying Migration: Add amount_paid to unlock_events");
        await client.query(`
            ALTER TABLE unlock_events 
            ADD COLUMN IF NOT EXISTS amount_paid NUMERIC DEFAULT 0;
        `);
        console.log("Migration Successful.");
    } catch (err) {
        console.error("Migration Failed:", err);
    } finally {
        await client.end();
        process.exit(0);
    }
}

applyMigration();
