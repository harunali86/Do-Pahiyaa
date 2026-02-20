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

    // 5. Insert Mock Listings
    console.log(`🏍️ Inserting ${demoListings.length} mock listings...`);
    const listingsToInsert = demoListings.map(l => ({
        seller_id: demoDealerId,
        title: l.title,
        make: l.brand,
        model: l.model,
        year: l.year,
        price: l.price,
        kms_driven: l.kms,
        city: l.city,
        description: l.description,
        status: 'published',
        images: [l.imageUrl],
        specs: l.specs,
        is_company_listing: l.postedBy === 'Dealer'
    }));

    const { error: listingError } = await supabase.from('listings').insert(listingsToInsert);

    if (listingError) {
        console.error('❌ Error inserting listings:', listingError.message);
    } else {
        console.log('✅ Seeding Complete! Site is now Demo-Ready.');
    }
}

seed();
