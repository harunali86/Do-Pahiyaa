-- Allow authenticated users to insert new leads
drop policy if exists "Buyers Create Leads" on public.leads;
create policy "Buyers Create Leads" on public.leads for insert with check (
  auth.uid() = buyer_id
);

-- Allow buyers to view their own leads
drop policy if exists "Buyers View Own Leads" on public.leads;
create policy "Buyers View Own Leads" on public.leads for select using (
  auth.uid() = buyer_id
);

-- Allow listing owners (Sellers) to view leads on their listings
drop policy if exists "Sellers View Leads on Own Listings" on public.leads;
create policy "Sellers View Leads on Own Listings" on public.leads for select using (
  exists (
    select 1 from public.listings
    where id = leads.listing_id
      and seller_id = auth.uid()
  )
);

-- Allow Dealers to view leads they have unlocked
drop policy if exists "Dealers View Unlocked Leads" on public.leads;
create policy "Dealers View Unlocked Leads" on public.leads for select using (
  exists (
    select 1 from public.unlock_events
    where lead_id = leads.id
      and dealer_id = auth.uid()
  )
);

-- Allow Dealers to view leads allocated to them via active subscriptions (Phase 17)
drop policy if exists "Dealers View Allocated Leads" on public.leads;
create policy "Dealers View Allocated Leads" on public.leads for select using (
  exists (
    select 1 from public.lead_allocations
    where lead_id = leads.id
      and dealer_id = auth.uid()
  )
);

-- Allow Admins and Super Admins to view all leads
drop policy if exists "Admins View All Leads" on public.leads;
create policy "Admins View All Leads" on public.leads for select using (
  public.is_admin_or_superadmin(auth.uid())
);

