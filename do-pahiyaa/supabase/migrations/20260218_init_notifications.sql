-- Notifications System
create type notification_type as enum ('info', 'success', 'warning', 'error');

create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  message text,
  type notification_type default 'info',
  is_read boolean default false,
  link text, -- Action link if any
  created_at timestamptz default now()
);

-- RLS
alter table public.notifications enable row level security;

create policy "Users manage own notifications" on public.notifications
  using (auth.uid() = user_id);

-- Realtime subscription support
alter publication supabase_realtime add table public.notifications;
