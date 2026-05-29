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
  availability jsonb not null default '{"slots":{"Mon":[],"Tue":[],"Wed":[],"Thu":[],"Fri":[],"Sat":[],"Sun":[]}}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists username text,
  add column if not exists email text,
  add column if not exists avatar_url text,
  add column if not exists availability jsonb not null default '{"slots":{"Mon":[],"Tue":[],"Wed":[],"Thu":[],"Fri":[],"Sat":[],"Sun":[]}}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.profiles
set
  full_name = coalesce(nullif(full_name, ''), split_part(email, '@', 1), 'User'),
  username = coalesce(nullif(username, ''), split_part(email, '@', 1), 'user-' || substring(replace(id::text, '-', '') from 1 for 8)),
  email = coalesce(nullif(email, ''), 'missing-email-' || substring(replace(id::text, '-', '') from 1 for 8) || '@example.com')
where full_name is null
   or full_name = ''
   or username is null
   or username = ''
   or email is null
   or email = '';

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
  expenses jsonb not null default '[]'::jsonb,
  pending jsonb not null default '[]'::jsonb,
  cases jsonb not null default '[]'::jsonb,
  hangout_proposals jsonb not null default '[]'::jsonb,
  bill_watch jsonb not null default '{}'::jsonb,
  peace_maker jsonb not null default '{}'::jsonb,
  color_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.groups
  add column if not exists name text,
  add column if not exists emoji text not null default '👥',
  add column if not exists code text,
  add column if not exists owner_id uuid references auth.users(id) on delete cascade,
  add column if not exists owner_username text,
  add column if not exists members jsonb not null default '[]'::jsonb,
  add column if not exists expenses jsonb not null default '[]'::jsonb,
  add column if not exists pending jsonb not null default '[]'::jsonb,
  add column if not exists cases jsonb not null default '[]'::jsonb,
  add column if not exists hangout_proposals jsonb not null default '[]'::jsonb,
  add column if not exists bill_watch jsonb not null default '{}'::jsonb,
  add column if not exists peace_maker jsonb not null default '{}'::jsonb,
  add column if not exists color_index integer not null default 0,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.groups
set name = coalesce(nullif(name, ''), 'Untitled Crew')
where name is null or name = '';

create unique index if not exists groups_code_key on public.groups (code);

-- =========================
-- Personalized Crew Invite Migration
-- =========================

update public.groups g
set pending = coalesce(
  (
    select jsonb_agg(
      jsonb_build_object(
        'id', coalesce(nullif(invite->>'id', ''), 'invite-' || substring(replace(gen_random_uuid()::text, '-', '') from 1 for 12)),
        'username',
          case
            when coalesce(invite->>'username', '') = '' and coalesce(invite->>'name', '') = '' then ''
            when left(coalesce(invite->>'username', invite->>'name', ''), 1) = '@'
              then lower(coalesce(invite->>'username', invite->>'name', ''))
            else '@' || lower(coalesce(invite->>'username', invite->>'name', ''))
          end,
        'name', coalesce(nullif(invite->>'name', ''), regexp_replace(coalesce(invite->>'username', ''), '^@', '')),
        'initials', coalesce(nullif(invite->>'initials', ''), upper(substring(regexp_replace(coalesce(invite->>'username', coalesce(invite->>'name', 'YO')), '^@', '') from 1 for 2))),
        'inviteCode', coalesce(nullif(invite->>'inviteCode', ''), upper(g.code || '-' || substring(replace(gen_random_uuid()::text, '-', '') from 1 for 4))),
        'createdAt', coalesce(nullif(invite->>'createdAt', ''), now()::text)
      )
    )
    from jsonb_array_elements(coalesce(g.pending, '[]'::jsonb)) invite
  ),
  '[]'::jsonb
)
where jsonb_typeof(coalesce(g.pending, '[]'::jsonb)) = 'array';

-- Resolve either a crew code or a personalized invite code from the database.
create or replace function public.find_group_by_join_code(join_code text)
returns public.groups
language sql
security definer
set search_path = public
as $$
  select g.*
  from public.groups g
  where upper(g.code) = upper(join_code)
    or exists (
      select 1
      from jsonb_array_elements(coalesce(g.pending, '[]'::jsonb)) invite
      where upper(coalesce(invite->>'inviteCode', '')) = upper(join_code)
    )
  order by case when upper(g.code) = upper(join_code) then 0 else 1 end, g.created_at asc
  limit 1;
$$;

grant execute on function public.find_group_by_join_code(text) to authenticated;

-- Accept a crew invite using the freshest database row so members are appended
-- atomically instead of replacing the crew from a stale client copy.
create or replace function public.accept_group_invite(
  join_code text,
  joining_member jsonb
)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  target_group public.groups;
  normalized_code text := upper(trim(coalesce(join_code, '')));
  member_user_id text := trim(coalesce(joining_member->>'userId', ''));
  member_username text := lower(trim(coalesce(joining_member->>'username', '')));
  member_email text := lower(trim(coalesce(joining_member->>'email', '')));
  member_name text := lower(trim(coalesce(joining_member->>'name', '')));
  next_members jsonb;
  next_pending jsonb;
begin
  select g.*
  into target_group
  from public.groups g
  where upper(g.code) = normalized_code
    or exists (
      select 1
      from jsonb_array_elements(coalesce(g.pending, '[]'::jsonb)) invite
      where upper(coalesce(invite->>'inviteCode', '')) = normalized_code
    )
  order by case when upper(g.code) = normalized_code then 0 else 1 end, g.created_at asc
  limit 1
  for update;

  if not found then
    raise exception 'No crew was found with that code.';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(coalesce(target_group.members, '[]'::jsonb)) member
    where (member_user_id <> '' and coalesce(member->>'userId', '') = member_user_id)
      or (member_username <> '' and lower(coalesce(member->>'username', '')) = member_username)
      or (member_email <> '' and lower(coalesce(member->>'email', '')) = member_email)
      or (member_name <> '' and lower(coalesce(member->>'name', '')) = member_name)
  ) then
    return target_group;
  end if;

  next_members := coalesce(target_group.members, '[]'::jsonb) || jsonb_build_array(joining_member);
  next_pending := coalesce(
    (
      select jsonb_agg(invite)
      from jsonb_array_elements(coalesce(target_group.pending, '[]'::jsonb)) invite
      where upper(coalesce(invite->>'inviteCode', '')) <> normalized_code
    ),
    '[]'::jsonb
  );

  update public.groups
  set members = next_members,
      pending = next_pending
  where id = target_group.id
  returning * into target_group;

  return target_group;
end;
$$;

grant execute on function public.accept_group_invite(text, jsonb) to authenticated;

-- =========================
-- Notifications Table
-- =========================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  recipient text,
  recipient_key text,
  group_id uuid references public.groups(id) on delete cascade,
  group_name text,
  proposal_id text,
  proposal_code text,
  link text,
  action_screen text,
  action_params jsonb not null default '{}'::jsonb,
  type text not null default 'general',
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notifications
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists recipient text,
  add column if not exists recipient_key text,
  add column if not exists group_id uuid references public.groups(id) on delete cascade,
  add column if not exists group_name text,
  add column if not exists proposal_id text,
  add column if not exists proposal_code text,
  add column if not exists link text,
  add column if not exists action_screen text,
  add column if not exists action_params jsonb not null default '{}'::jsonb,
  add column if not exists type text not null default 'general',
  add column if not exists message text not null default '',
  add column if not exists read boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists set_notifications_updated_at on public.notifications;
create trigger set_notifications_updated_at
before update on public.notifications
for each row execute procedure public.set_updated_at();

alter table public.notifications enable row level security;

drop policy if exists "Users can read their own notifications" on public.notifications;
create policy "Users can read their own notifications"
on public.notifications
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Authenticated users can create notifications" on public.notifications;
create policy "Authenticated users can create notifications"
on public.notifications
for insert
to authenticated
with check (true);

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications"
on public.notifications
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

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
drop policy if exists "Owners or crew admins can delete groups" on public.groups;
create policy "Owners or crew admins can delete groups"
on public.groups
for delete
to authenticated
using (
  auth.uid() = owner_id
  or exists (
    select 1
    from jsonb_array_elements(coalesce(members, '[]'::jsonb)) as member
    where coalesce(member->>'userId', '') = auth.uid()::text
      and coalesce(member->>'role', 'Member') = 'Admin'
  )
);

-- =========================
-- Hangouts Table
-- =========================

create table if not exists public.hangouts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date text,
  time text,
  location text not null,
  vibe text,
  code text not null unique,
  group_id uuid references public.groups(id) on delete set null,
  creator_id uuid not null references auth.users(id) on delete cascade,
  participants jsonb not null default '[]'::jsonb,
  recommendations jsonb not null default '[]'::jsonb,
  ratings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hangouts
  add column if not exists name text,
  add column if not exists date text,
  add column if not exists time text,
  add column if not exists location text,
  add column if not exists vibe text,
  add column if not exists code text,
  add column if not exists group_id uuid references public.groups(id) on delete set null,
  add column if not exists creator_id uuid references auth.users(id) on delete cascade,
  add column if not exists participants jsonb not null default '[]'::jsonb,
  add column if not exists recommendations jsonb not null default '[]'::jsonb,
  add column if not exists ratings jsonb not null default '[]'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.hangouts
set
  name = coalesce(nullif(name, ''), 'Untitled Hangout'),
  location = coalesce(nullif(location, ''), 'TBD')
where name is null
   or name = ''
   or location is null
   or location = '';

create unique index if not exists hangouts_code_key on public.hangouts (code);

drop trigger if exists set_hangouts_updated_at on public.hangouts;
create trigger set_hangouts_updated_at
before update on public.hangouts
for each row execute procedure public.set_updated_at();

alter table public.hangouts enable row level security;

drop policy if exists "Hangouts are readable by authenticated users" on public.hangouts;
create policy "Hangouts are readable by authenticated users"
on public.hangouts
for select
to authenticated
using (true);

drop policy if exists "Users can create hangouts" on public.hangouts;
create policy "Users can create hangouts"
on public.hangouts
for insert
to authenticated
with check (auth.uid() = creator_id);

drop policy if exists "Creators can update hangouts" on public.hangouts;
create policy "Creators can update hangouts"
on public.hangouts
for update
to authenticated
using (auth.uid() = creator_id)
with check (auth.uid() = creator_id);

drop policy if exists "Creators can delete hangouts" on public.hangouts;
create policy "Creators can delete hangouts"
on public.hangouts
for delete
to authenticated
using (auth.uid() = creator_id);

-- =========================
-- Trips Table
-- =========================

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  destination text not null,
  start_date text not null,
  end_date text not null,
  invite_code text unique,
  budget numeric not null default 0,
  spent numeric not null default 0,
  members jsonb not null default '[]'::jsonb,
  color jsonb not null default '{}'::jsonb,
  status text not null default 'Planning',
  itinerary jsonb not null default '[]'::jsonb,
  itinerary_suggestions jsonb not null default '[]'::jsonb,
  packing_list jsonb not null default '[]'::jsonb,
  savings_progress jsonb not null default '[]'::jsonb,
  planning_checklist jsonb not null default '[]'::jsonb,
  booking_info jsonb not null default '{}'::jsonb,
  trip_preferences jsonb not null default '[]'::jsonb,
  hidden_for jsonb not null default '[]'::jsonb,
  group_savings_goal numeric not null default 0,
  member_savings_targets jsonb not null default '[]'::jsonb,
  ratings jsonb not null default '[]'::jsonb,
  creator_id uuid not null references auth.users(id) on delete cascade,
  group_id uuid references public.groups(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trips
  add column if not exists name text,
  add column if not exists destination text,
  add column if not exists start_date text,
  add column if not exists end_date text,
  add column if not exists invite_code text,
  add column if not exists budget numeric not null default 0,
  add column if not exists spent numeric not null default 0,
  add column if not exists members jsonb not null default '[]'::jsonb,
  add column if not exists color jsonb not null default '{}'::jsonb,
  add column if not exists status text not null default 'Planning',
  add column if not exists itinerary jsonb not null default '[]'::jsonb,
  add column if not exists itinerary_suggestions jsonb not null default '[]'::jsonb,
  add column if not exists packing_list jsonb not null default '[]'::jsonb,
  add column if not exists savings_progress jsonb not null default '[]'::jsonb,
  add column if not exists planning_checklist jsonb not null default '[]'::jsonb,
  add column if not exists booking_info jsonb not null default '{}'::jsonb,
  add column if not exists trip_preferences jsonb not null default '[]'::jsonb,
  add column if not exists hidden_for jsonb not null default '[]'::jsonb,
  add column if not exists group_savings_goal numeric not null default 0,
  add column if not exists member_savings_targets jsonb not null default '[]'::jsonb,
  add column if not exists ratings jsonb not null default '[]'::jsonb,
  add column if not exists creator_id uuid references auth.users(id) on delete cascade,
  add column if not exists group_id uuid references public.groups(id) on delete set null,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.trips
set
  name = coalesce(nullif(name, ''), 'Untitled Trip'),
  destination = coalesce(nullif(destination, ''), 'TBD destination'),
  start_date = coalesce(nullif(start_date, ''), current_date::text),
  end_date = coalesce(nullif(end_date, ''), current_date::text)
where name is null
   or name = ''
   or destination is null
   or destination = ''
   or start_date is null
   or start_date = ''
   or end_date is null
   or end_date = '';

create unique index if not exists trips_invite_code_key on public.trips (invite_code);

update public.trips
set invite_code = upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 6))
where coalesce(invite_code, '') = '';

update public.trips
set itinerary_suggestions = '[]'::jsonb
where itinerary_suggestions is null;

update public.trips
set savings_progress = '[]'::jsonb
where savings_progress is null;

update public.trips
set planning_checklist = '[]'::jsonb
where planning_checklist is null;

update public.trips
set booking_info = '{}'::jsonb
where booking_info is null;

update public.trips
set trip_preferences = '[]'::jsonb
where trip_preferences is null;

update public.trips
set hidden_for = '[]'::jsonb
where hidden_for is null;

update public.trips
set group_savings_goal = coalesce(group_savings_goal, budget, 0)
where group_savings_goal is null
   or group_savings_goal = 0;

update public.trips
set member_savings_targets = '[]'::jsonb
where member_savings_targets is null;

drop trigger if exists set_trips_updated_at on public.trips;
create trigger set_trips_updated_at
before update on public.trips
for each row execute procedure public.set_updated_at();

alter table public.trips enable row level security;

drop policy if exists "Users can read their own trips" on public.trips;
drop policy if exists "Users can read their own or crew trips" on public.trips;
create policy "Users can read their own or crew trips"
on public.trips
for select
to authenticated
using (
  auth.uid() = creator_id
  or (
    group_id is not null
    and exists (
      select 1
      from public.groups g
      cross join lateral jsonb_array_elements(coalesce(g.members, '[]'::jsonb)) as member
      where g.id = trips.group_id
        and coalesce(member->>'userId', '') = auth.uid()::text
    )
  )
);

drop policy if exists "Users can create trips" on public.trips;
create policy "Users can create trips"
on public.trips
for insert
to authenticated
with check (auth.uid() = creator_id);

drop policy if exists "Users can update their own trips" on public.trips;
drop policy if exists "Users can update their own or crew trips" on public.trips;
create policy "Users can update their own or crew trips"
on public.trips
for update
to authenticated
using (
  auth.uid() = creator_id
  or (
    group_id is not null
    and exists (
      select 1
      from public.groups g
      cross join lateral jsonb_array_elements(coalesce(g.members, '[]'::jsonb)) as member
      where g.id = trips.group_id
        and coalesce(member->>'userId', '') = auth.uid()::text
    )
  )
)
with check (
  auth.uid() = creator_id
  or (
    group_id is not null
    and exists (
      select 1
      from public.groups g
      cross join lateral jsonb_array_elements(coalesce(g.members, '[]'::jsonb)) as member
      where g.id = trips.group_id
        and coalesce(member->>'userId', '') = auth.uid()::text
    )
  )
);

drop policy if exists "Users can delete their own trips" on public.trips;
create policy "Users can delete their own trips"
on public.trips
for delete
to authenticated
using (auth.uid() = creator_id);

-- =========================
-- Scheduling Helper RPCs
-- =========================

create or replace function public.save_my_availability(next_availability jsonb)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_profile public.profiles;
begin
  update public.profiles
  set availability = next_availability,
      updated_at = now()
  where id = auth.uid()
  returning * into saved_profile;

  return saved_profile;
end;
$$;

create or replace function public.save_my_profile(
  next_profile_id uuid,
  next_full_name text,
  next_username text,
  next_email text,
  next_avatar_url text
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_profile public.profiles;
begin
  insert into public.profiles (
    id,
    full_name,
    username,
    email,
    avatar_url
  )
  values (
    next_profile_id,
    next_full_name,
    next_username,
    next_email,
    next_avatar_url
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    username = excluded.username,
    email = excluded.email,
    avatar_url = excluded.avatar_url,
    updated_at = now()
  returning * into saved_profile;

  return saved_profile;
end;
$$;

grant execute on function public.save_my_profile(uuid, text, text, text, text) to authenticated;

create or replace function public.get_participant_availability(participant_ids uuid[])
returns table (
  id uuid,
  full_name text,
  username text,
  availability jsonb
)
language sql
security definer
set search_path = public
as $$
  select p.id, p.full_name, p.username, p.availability
  from public.profiles p
  where p.id = any(participant_ids);
$$;

create or replace function public.create_group(
  next_owner_id uuid,
  next_name text,
  next_emoji text,
  next_code text,
  next_owner_username text,
  next_members jsonb,
  next_expenses jsonb,
  next_pending jsonb,
  next_cases jsonb,
  next_hangout_proposals jsonb,
  next_bill_watch jsonb,
  next_peace_maker jsonb,
  next_color_index integer
)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_group public.groups;
begin
  insert into public.groups (
    name,
    emoji,
    code,
    owner_id,
    owner_username,
    members,
    expenses,
    pending,
    cases,
    hangout_proposals,
    bill_watch,
    peace_maker,
    color_index
  )
  values (
    next_name,
    next_emoji,
    next_code,
    next_owner_id,
    next_owner_username,
    next_members,
    next_expenses,
    next_pending,
    next_cases,
    next_hangout_proposals,
    next_bill_watch,
    next_peace_maker,
    next_color_index
  )
  returning * into saved_group;

  return saved_group;
end;
$$;

grant execute on function public.create_group(
  uuid,
  text,
  text,
  text,
  text,
  jsonb,
  jsonb,
  jsonb,
  jsonb,
  jsonb,
  jsonb,
  jsonb,
  integer
) to authenticated;

create or replace function public.create_hangout(
  hangout_name text,
  hangout_date text,
  hangout_time text,
  hangout_location text,
  hangout_vibe text,
  hangout_code text,
  hangout_group_id uuid,
  hangout_participants jsonb,
  hangout_recommendations jsonb
)
returns public.hangouts
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_hangout public.hangouts;
begin
  insert into public.hangouts (
    name,
    date,
    time,
    location,
    vibe,
    code,
    group_id,
    creator_id,
    participants,
    recommendations
  )
  values (
    hangout_name,
    hangout_date,
    hangout_time,
    hangout_location,
    hangout_vibe,
    hangout_code,
    hangout_group_id,
    auth.uid(),
    hangout_participants,
    hangout_recommendations
  )
  returning * into saved_hangout;

  return saved_hangout;
end;
$$;

-- =========================
-- Realtime Publication
-- =========================

do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.groups;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.trips;
exception when duplicate_object then null;
end $$;
