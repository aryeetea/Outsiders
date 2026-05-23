-- =========================
-- Outsiders Supabase Setup
-- =========================

-- Enable UUID helpers
create extension if not exists pgcrypto;

-- =========================
-- Profiles Table
-- =========================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  username text not null unique,
  email text not null,
  avatar_url text,
  availability jsonb not null default '{"days":[],"times":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists username text,
  add column if not exists email text,
  add column if not exists avatar_url text,
  add column if not exists availability jsonb not null default '{"days":[],"times":[]}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.profiles
  alter column full_name set not null,
  alter column username set not null,
  alter column email set not null;

-- =========================
-- Shared Updated-At Trigger
-- =========================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- =========================
-- Auto-Create Profile On Signup
-- =========================

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
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
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

-- =========================
-- Profiles RLS Policies
-- =========================

alter table public.profiles enable row level security;

drop policy if exists "Profiles are readable by authenticated users" on public.profiles;
create policy "Profiles are readable by authenticated users"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- =========================
-- Groups Table
-- =========================

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

alter table public.groups
  add column if not exists emoji text not null default '👥',
  add column if not exists code text,
  add column if not exists owner_id uuid references auth.users(id) on delete cascade,
  add column if not exists owner_username text,
  add column if not exists members jsonb not null default '[]'::jsonb,
  add column if not exists pending jsonb not null default '[]'::jsonb,
  add column if not exists cases jsonb not null default '[]'::jsonb,
  add column if not exists bill_watch jsonb not null default '{}'::jsonb,
  add column if not exists peace_maker jsonb not null default '{}'::jsonb,
  add column if not exists color_index integer not null default 0,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists groups_code_key on public.groups (code);

-- =========================
-- Groups Updated-At Trigger
-- =========================

drop trigger if exists set_groups_updated_at on public.groups;
create trigger set_groups_updated_at
before update on public.groups
for each row execute procedure public.set_updated_at();

-- =========================
-- Groups RLS Policies
-- =========================

alter table public.groups enable row level security;

drop policy if exists "Groups are readable by authenticated users" on public.groups;
create policy "Groups are readable by authenticated users"
on public.groups
for select
to authenticated
using (true);

drop policy if exists "Users can create groups they own" on public.groups;
create policy "Users can create groups they own"
on public.groups
for insert
to authenticated
with check (auth.uid() = owner_id);

drop policy if exists "Authenticated users can update groups" on public.groups;
create policy "Authenticated users can update groups"
on public.groups
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Only owners can delete groups" on public.groups;
create policy "Only owners can delete groups"
on public.groups
for delete
to authenticated
using (auth.uid() = owner_id);
