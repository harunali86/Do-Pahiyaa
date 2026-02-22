const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env.local
dotenv.config({ path: '.env.local' });

async function migrate() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ DATABASE_URL is missing in .env.local');
        process.exit(1);
    }

    console.log('🔌 Connecting to Supabase...');
    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false } // Required for Supabase
    });

    try {
        await client.connect();
        console.log('✅ Connected.');

        const sqlPath = path.join(process.cwd(), 'supabase/migrations/20260217_init_lead_engine.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📜 Applying Schema: 20260217_init_lead_engine.sql ...');
        // Split by semicolon to execute statements individually if needed, 
        // but simple schema files often run fine as one query in pg
        await client.query(sql);

        console.log('🎉 Migration Successful! The Lead Engine is ready.');
    } catch (err) {
        console.error('❌ Migration Failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
