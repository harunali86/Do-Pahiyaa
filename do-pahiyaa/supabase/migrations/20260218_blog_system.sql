-- Blog System Schema

-- Categories Table
create table if not exists public.blog_categories (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    slug text not null unique,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tags Table
create table if not exists public.blog_tags (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    slug text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Blog Posts Table
create table if not exists public.blog_posts (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    slug text not null unique,
    excerpt text,
    content jsonb default '{}'::jsonb, -- Stores Novel.sh / Tiptap JSON content
    cover_image text,
    author_id uuid references public.profiles(id) on delete set null,
    category_id uuid references public.blog_categories(id) on delete set null,
    status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
    published_at timestamp with time zone,
    views integer default 0,
    meta_title text,
    meta_description text,
    canonical_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Post Tags Junction
create table if not exists public.blog_post_tags (
    post_id uuid references public.blog_posts(id) on delete cascade,
    tag_id uuid references public.blog_tags(id) on delete cascade,
    primary key (post_id, tag_id)
);

-- Indexes
create index if not exists idx_blog_posts_slug on public.blog_posts(slug);
create index if not exists idx_blog_posts_status on public.blog_posts(status);
create index if not exists idx_blog_posts_author on public.blog_posts(author_id);
create index if not exists idx_blog_posts_category on public.blog_posts(category_id);
create index if not exists idx_blog_categories_slug on public.blog_categories(slug);
create index if not exists idx_blog_tags_slug on public.blog_tags(slug);

-- RLS Policies

-- Enable RLS
alter table public.blog_posts enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_post_tags enable row level security;

-- Public Read Policies
create policy "Public can view published posts"
    on public.blog_posts for select
    using (status = 'published');

create policy "Public can view categories"
    on public.blog_categories for select
    using (true);

create policy "Public can view tags"
    on public.blog_tags for select
    using (true);

create policy "Public can view post tags"
    on public.blog_post_tags for select
    using (true);

-- Admin Write Policies (using existing "admin" role check in profiles)
-- Note: Assuming authenticated users with role 'admin' can manage blog

create policy "Admins can manage posts"
    on public.blog_posts for all
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid() and profiles.role = 'admin'
        )
    );

create policy "Admins can manage categories"
    on public.blog_categories for all
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid() and profiles.role = 'admin'
        )
    );

create policy "Admins can manage tags"
    on public.blog_tags for all
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid() and profiles.role = 'admin'
        )
    );

create policy "Admins can manage post tags"
    on public.blog_post_tags for all
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid() and profiles.role = 'admin'
        )
    );

-- Seed Categories
insert into public.blog_categories (name, slug, description) values
    ('Bike Reviews', 'bike-reviews', 'In-depth reviews of the latest bikes'),
    ('Maintenance', 'maintenance', 'Tips to keep your bike running smooth'),
    ('Buying Guides', 'buying-guides', 'Help with choosing your next ride'),
    ('Industry News', 'industry-news', 'Latest updates from the two-wheeler world')
on conflict (slug) do nothing;
