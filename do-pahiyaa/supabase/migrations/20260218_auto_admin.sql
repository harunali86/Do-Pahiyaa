-- Trigger to auto-promote admin@gmail.com to admin role
create or replace function public.auto_promote_admin()
returns trigger as $$
begin
  if new.email = 'admin@gmail.com' then
    update public.profiles
    set role = 'admin'
    where id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Drop if exists to avoid duplication errors (though trigger names unique usually)
drop trigger if exists on_auth_user_created_admin_check on public.profiles;

-- Create Trigger (after insert on profiles)
create trigger on_auth_user_created_admin_check
  after insert on public.profiles
  for each row execute procedure public.auto_promote_admin();
