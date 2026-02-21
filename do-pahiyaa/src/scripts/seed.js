const { Client } = require('pg');
const dotenv = require('dotenv');

// Load .env.local
dotenv.config({ path: '.env.local' });

const SEED_DEALER_ID = '00000000-0000-0000-0000-000000000001'; // Fixed UUID for demo

async function seed() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ DATABASE_URL is missing in .env.local');
        process.exit(1);
    }

    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('🌱 Connected. Seeding data...');

        // 1. Create Verified Dealer Profile (Idempotent)
        // We need an auth user first. Since we can't easily create auth users via SQL without admin API,
        // we will assume the profile exists or insert it blindly into public.profiles if foreign key allows (it usually requires auth.users).
        // WAIT: public.profiles references auth.users. I cannot insert into profiles without an auth user.

        // Strategy: I will use a placeholder UUID that hopefully works if FK constraints are not strictly enforced on the auth schema side for raw SQL,
        // OR I have to assume the user has signed up. 
        // ACTUALLY: Supabase Auth is separate. 
        // For the sake of this "Demo Seed", let's try to insert into auth.users first if possible, or fail gracefully.
        // Direct insert into auth.users is tricky/dangerous.

        // BETTER STRATEGY: 
        // I will use a real user ID if the user provides one, OR I will just skip the auth part and try to insert a profile 
        // assuming the constraint might be deferred or I can insert into auth.users (if I have postgres superuser, which I do).

        // Let's try to insert a fake auth user first (since we have postgres role).

        console.log('👤 ensuring demo dealer user...');

        // Insert into auth.users (this is hacky but needed for full seed without manual signup)
        // Password hash is for "password" (bcrypt) - just a placeholder, they won't log in with it easily without proper hashing
        await client.query(`
            INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
            VALUES (
                '${SEED_DEALER_ID}', 
                'dealer@dopahiyaa.com', 
                '$2a$10$abcdefg...', 
                now(), 
                '{"provider":"email","providers":["email"]}', 
                '{"full_name":"Expert Bikes Mumbai"}', 
                now(), 
                now(), 
                'authenticated', 
                'authenticated'
            )
            ON CONFLICT (id) DO NOTHING;
        `);

        // 2. Insert Profile
        await client.query(`
            INSERT INTO public.profiles (id, email, role, full_name, is_verified)
            VALUES ('${SEED_DEALER_ID}', 'dealer@dopahiyaa.com', 'dealer', 'Expert Bikes Mumbai', true)
            ON CONFLICT (id) DO UPDATE SET role = 'dealer', is_verified = true;
        `);

        // 3. Insert Dealer Details
        await client.query(`
            INSERT INTO public.dealers (profile_id, business_name, showroom_address, subscription_status, credits_balance, verified_at)
            VALUES ('${SEED_DEALER_ID}', 'Expert Bikes Mumbai', 'Andheri West, Mumbai', 'active', 50, now())
            ON CONFLICT (profile_id) DO NOTHING;
        `);

        // 4. Insert Verified Listings
        const listings = [
            {
                title: "Royal Enfield Classic 350 - Mint Condition",
                make: "Royal Enfield", model: "Classic 350", year: 2022, price: 185000, kms: 4500, city: "Mumbai",
                image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80"
            },
            {
                title: "KTM Duke 390 - Beast Mode",
                make: "KTM", model: "Duke 390", year: 2023, price: 290000, kms: 2100, city: "Mumbai",
                image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80"
            },
            {
                title: "Ather 450X Gen 3 - Electric Speed",
                make: "Ather", model: "450X", year: 2023, price: 135000, kms: 1200, city: "Bangalore",
                image: "https://images.unsplash.com/photo-1621932906530-1c095c27633d?auto=format&fit=crop&w=800&q=80"
            },
            {
                title: "Honda CB350 RS - Dual Tone",
                make: "Honda", model: "CB350 RS", year: 2021, price: 165000, kms: 8900, city: "Pune",
                image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=800&q=80"
            }
        ];

        console.log('🏍️ Inserting listings...');
        for (const bike of listings) {
            await client.query(`
                INSERT INTO public.listings (seller_id, title, make, model, year, price, kms_driven, city, images, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'published')
            `, [SEED_DEALER_ID, bike.title, bike.make, bike.model, bike.year, bike.price, bike.kms, bike.city, [bike.image]]);
        }

        console.log('✅ Seed Complete: Added Dealer & 4 Listings.');

    } catch (err) {
        console.error('❌ Seed Failed:', err);
    } finally {
        await client.end();
    }
}

seed();
