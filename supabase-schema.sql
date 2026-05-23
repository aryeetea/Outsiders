create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  username text not null unique,
  email text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, username, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    username = excluded.username,
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create policy "Profiles are readable by authenticated users"
on public.profiles
for select
to authenticated
using (true);

create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text not null default '👥',
  code text not null unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  owner_username text,
  members jsonb not null default '[]'::jsonb,
  pending jsonb not null default '[]'::jsonb,
  cases jsonb not null default '[]'::jsonb,
  bill_watch jsonb not null default '{}'::jsonb,
  peace_maker jsonb not null default '{}'::jsonb,
  color_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.groups enable row level security;

create or replace function public.set_group_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_groups_updated_at on public.groups;
create trigger set_groups_updated_at
before update on public.groups
for each row execute procedure public.set_group_updated_at();

create policy "Groups are readable by authenticated users"
on public.groups
for select
to authenticated
using (true);

create policy "Users can create groups they own"
on public.groups
for insert
to authenticated
with check (auth.uid() = owner_id);

create policy "Authenticated users can update groups"
on public.groups
for update
to authenticated
using (true)
with check (true);

create policy "Only owners can delete groups"
on public.groups
for delete
to authenticated
using (auth.uid() = owner_id);
