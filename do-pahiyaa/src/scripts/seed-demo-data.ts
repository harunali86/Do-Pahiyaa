import { createClient } from '@supabase/supabase-js';
import { demoListings } from '../lib/demo/mock-data';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
    console.log('🚀 Starting Demo Seeding...');

    // 1. Patch Schema (Fixing the reported KYC fetch error)
    console.log('🛠️ Patching Profiles schema...');
    let schemaPatched = false;
    try {
        const { error: patchError } = await supabase.rpc('exec_sql', {
            sql_string: `
                ALTER TABLE public.profiles 
                ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
            `
        });
        if (!patchError) {
            schemaPatched = true;
        } else {
            console.log('⚠️ RPC Error (likely missing exec_sql):', patchError.message);
        }
    } catch (e) {
        console.log('⚠️ Direct patch failed, skipping...');
    }

    if (!schemaPatched) {
        console.log('⚠️ Note: Ensure public.profiles has a "status" column manually if RLS blocks this.');
    }


    // 2. Create Demo Admin
    const demoAdminId = '00000000-0000-0000-0000-000000000001';
    console.log('👤 Creating Demo Admin...');
    await supabase.from('profiles').upsert({
        id: demoAdminId,
        email: 'admin@dopahiyaa.com',
        full_name: 'Harun AI Admin',
        role: 'admin',
        status: 'active'
    });

    // 3. Create Demo Dealers
    const demoDealerId = '00000000-0000-0000-0000-000000000002';
    console.log('🏢 Creating Demo Dealer...');
    await supabase.from('profiles').upsert({
        id: demoDealerId,
        email: 'dealer@dopahiyaa.com',
        full_name: 'Sai Motors Bengaluru',
        role: 'dealer',
        status: 'pending_verification'
    });

    await supabase.from('dealers').upsert({
        profile_id: demoDealerId,
        business_name: 'Sai Motors Bengaluru',
        showroom_address: 'Indiranagar, Bengaluru',
        subscription_status: 'active'
    });

    // 4. Create KYC Docs for Dealer
    console.log('📄 Adding Demo KYC documents...');
    await supabase.from('kyc_documents').upsert([
        {
            user_id: demoDealerId,
            document_type: 'gst_shop_license',
            status: 'pending',
            file_url: 'demo/gst.pdf'
        },
        {
            user_id: demoDealerId,
            document_type: 'aadhar',
            status: 'pending',
            file_url: 'demo/aadhar.jpg'
        }
    ]);

    // 4. Generate & Insert massive listing data (180+ bikes)
    const cities = ["Bengaluru", "Delhi", "Mumbai", "Hyderabad", "Chennai", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Kochi"];
    const massiveListings: any[] = [];

    console.log('🏍️ Generating 180+ mock listings across India...');

    for (let i = 0; i < 185; i++) {
        const base = demoListings[i % demoListings.length];
        const city = cities[i % cities.length];
        const priceOffset = (i % 5) * 5000 - 10000;
        const kmsOffset = (i % 7) * 450;

        massiveListings.push({
            seller_id: i % 2 === 0 ? demoAdminId : demoDealerId,
            title: `${base.title} (${i + 1})`,
            make: base.brand,
            model: base.model,
            year: base.year - (i % 3),
            price: base.price + priceOffset,
            kms_driven: base.kms + kmsOffset,
            city: city,
            description: base.description,
            images: [base.imageUrl],
            status: 'published',
            is_company_listing: i % 3 === 0
        });

    }

    const { error: listingsError } = await supabase
        .from('listings')
        .insert(massiveListings);

    if (listingsError) console.error('❌ Error inserting listings:', listingsError.message);
    else console.log(`✅ Successfully inserted ${massiveListings.length} listings!`);

    console.log('✅ Seeding Complete! Site is now MASSIVELY Demo-Ready.');
}

seed();
