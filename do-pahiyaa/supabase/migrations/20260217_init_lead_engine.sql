-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'dealer', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
create type listing_status as enum ('draft', 'published', 'sold', 'archived', 'rejected');
create type lead_status as enum ('new', 'unlocked', 'contacted', 'converted', 'closed');

-- 2. PROFILES (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  role user_role default 'user',
  full_name text,
  phone text,
  avatar_url text,
  is_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. DEALERS (Data for B2B)
create table public.dealers (
  profile_id uuid references public.profiles(id) on delete cascade primary key,
  business_name text not null,
  gst_number text,
  showroom_address text,
  subscription_status text default 'inactive', -- active, past_due, canceled
  credits_balance int default 0, -- Wallet for unlocking leads
  verified_at timestamptz
);

-- 4. LISTINGS (The Inventory)
create table public.listings (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references public.profiles(id) not null,
  title text not null,
  make text not null,
  model text not null,
  year int not null,
  price numeric(12, 2) not null,
  kms_driven int not null,
  city text not null,
  description text,
  specs jsonb default '{}'::jsonb, 
  images text[] default '{}',
  status listing_status default 'draft',
  is_company_listing boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_listings_seller on public.listings(seller_id);
create index idx_listings_status on public.listings(status);
create index idx_listings_market on public.listings(make, model, city) where status = 'published';

-- 5. LEADS (Monetization Core)
create table public.leads (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.listings(id) not null,
  buyer_id uuid references public.profiles(id) not null,
  message text,
  status lead_status default 'new',
  created_at timestamptz default now(),
  unique(listing_id, buyer_id) -- Prevent duplicate leads
);

-- 6. UNLOCK EVENTS (Transaction Log)
create table public.unlock_events (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references public.leads(id) not null,
  dealer_id uuid references public.dealers(profile_id) not null,
  cost_credits int not null,
  unlocked_at timestamptz default now()
);

-- 7. SUBSCRIPTIONS (Razorpay Integration)
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  dealer_id uuid references public.dealers(profile_id) not null,
  razorpay_sub_id text unique not null,
  plan_id text not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  status text not null,
  created_at timestamptz default now()
);

-- 8. ROW LEVEL SECURITY (RLS)

-- Profiles
alter table public.profiles enable row level security;
create policy "Public Read Profiles" on public.profiles for select using (true);
create policy "Self Update Profiles" on public.profiles for update using (auth.uid() = id);

-- Dealers
alter table public.dealers enable row level security;
create policy "Public Read Dealers" on public.dealers for select using (true);
create policy "Admin Manage Dealers" on public.dealers using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Listings
alter table public.listings enable row level security;
create policy "Public Read Published" on public.listings for select using (status = 'published');
create policy "Owner Manage Listings" on public.listings using (auth.uid() = seller_id);
create policy "Admin Manage All Listings" on public.listings using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Leads
alter table public.leads enable row level security;
create policy "Admin View All Leads" on public.leads for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Buyer View Own Leads" on public.leads for select using (auth.uid() = buyer_id);
create policy "Seller View Leads on Own Listings" on public.leads for select using (
  exists (select 1 from public.listings where id = leads.listing_id and seller_id = auth.uid())
);
-- Dealer can view lead ONLY if they have unlocked it OR it is their own listing
create policy "Dealer View Unlocked Leads" on public.leads for select using (
  exists (select 1 from public.unlock_events where lead_id = leads.id and dealer_id = auth.uid())
);

-- Unlock Events
alter table public.unlock_events enable row level security;
create policy "Dealer View Own Unlocks" on public.unlock_events for select using (dealer_id = auth.uid());
