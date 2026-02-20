
import { Client } from "pg";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

async function applyMigration() {
    console.log("Connecting to database...", connectionString);
    const client = new Client({ connectionString });
    await client.connect();

    try {
        console.log("Applying Migration: Add is_blocked to profiles");
        await client.query(`
            ALTER TABLE profiles 
            ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT FALSE;
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
