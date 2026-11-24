-- ApnaWard multi-city foundation (Supabase PostgreSQL + Auth)
-- Run in Supabase SQL Editor. Does not import or overwrite browser demo records.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role text not null default 'resident' check (role in ('resident','ward_admin','city_admin','platform_admin')),
  state_code text,
  district_name text,
  city_name text,
  ward_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.locations(id) on delete restrict,
  level text not null check (level in ('state','district','city','ward','locality')),
  code text,
  name text not null,
  state_code text,
  latitude double precision check (latitude is null or latitude between -90 and 90),
  longitude double precision check (longitude is null or longitude between -180 and 180),
  boundary_geojson jsonb,
  is_active boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  unique(parent_id, level, name)
);

create index if not exists locations_parent_idx on public.locations(parent_id, level) where is_active = true;
create index if not exists locations_state_idx on public.locations(state_code, level) where is_active = true;

alter table public.profiles
  drop constraint if exists profiles_ward_id_fkey;
alter table public.profiles
  add constraint profiles_ward_id_fkey foreign key (ward_id) references public.locations(id) on delete set null;

create table if not exists public.civic_issues (
  id uuid primary key default gen_random_uuid(),
  tracking_code text not null unique,
  reporter_id uuid not null references auth.users(id) on delete restrict,
  location_id uuid references public.locations(id) on delete set null,
  title text not null check (char_length(title) between 4 and 240),
  description text not null check (char_length(description) between 5 and 5000),
  category text not null check (category in ('road_damage','garbage','water_leakage','streetlight','drainage','public_safety')),
  severity text not null default 'Medium' check (severity in ('Low','Medium','High','Critical')),
  status text not null default 'Reported' check (status in ('Reported','In Progress','Resolved')),
  state_code text,
  district_name text,
  city_name text,
  ward_name text,
  locality_name text,
  landmark text,
  latitude double precision check (latitude is null or latitude between -90 and 90),
  longitude double precision check (longitude is null or longitude between -180 and 180),
  photo_path text,
  ai_analysis jsonb,
  ai_suggestion_edited boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists civic_issues_reporter_idx on public.civic_issues(reporter_id, created_at desc);
create index if not exists civic_issues_location_idx on public.civic_issues(location_id, status, created_at desc);
create index if not exists civic_issues_city_idx on public.civic_issues(state_code, district_name, city_name, ward_name);

create table if not exists public.issue_status_updates (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.civic_issues(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  status text not null check (status in ('Reported','In Progress','Resolved')),
  note text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists issue_updates_issue_idx on public.issue_status_updates(issue_id, created_at);

create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.is_ward_operator()
returns boolean language sql stable security definer set search_path = public
as $$ select coalesce(public.current_user_role() in ('ward_admin','city_admin','platform_admin'), false) $$;

-- Operators are scoped to their assigned geography. A ward_admin's profile.ward_id
-- must match civic_issues.location_id (the report's selected ward location).
-- A city_admin is scoped by state_code + city_name. platform_admin is global.
create or replace function public.can_manage_issue(
  target_location_id uuid,
  target_state_code text,
  target_city_name text
)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'platform_admin'
        or (
          p.role = 'city_admin'
          and p.state_code is not null
          and p.city_name is not null
          and upper(p.state_code) = upper(coalesce(target_state_code, ''))
          and lower(p.city_name) = lower(coalesce(target_city_name, ''))
        )
        or (p.role = 'ward_admin' and p.ward_id is not null and p.ward_id = target_location_id)
      )
  );
$$;

create or replace function public.can_read_issue(
  target_reporter_id uuid,
  target_location_id uuid,
  target_state_code text,
  target_city_name text
)
returns boolean language sql stable security definer set search_path = public
as $$
  select target_reporter_id = auth.uid()
      or public.can_manage_issue(target_location_id, target_state_code, target_city_name);
$$;

revoke all on function public.can_manage_issue(uuid, text, text) from public;
revoke all on function public.can_read_issue(uuid, uuid, text, text) from public;
grant execute on function public.can_manage_issue(uuid, text, text) to authenticated;
grant execute on function public.can_read_issue(uuid, uuid, text, text) to authenticated;

alter table public.profiles enable row level security;
alter table public.locations enable row level security;
alter table public.civic_issues enable row level security;
alter table public.issue_status_updates enable row level security;

-- Profiles: users can read/update only their own profile. Role assignment must be done
-- by a trusted administrator from the Supabase dashboard/server, never by public signup.
drop policy if exists "profile read own or operator" on public.profiles;
drop policy if exists "profile read own only" on public.profiles;
create policy "profile read own only" on public.profiles for select to authenticated
using (id = auth.uid());
drop policy if exists "profile update own basic fields" on public.profiles;
create policy "profile update own basic fields" on public.profiles for update to authenticated
using (id = auth.uid()) with check (id = auth.uid());
-- Column grants prevent a resident from promoting their own role through profile updates.
revoke update on public.profiles from authenticated;
grant update (display_name, state_code, district_name, city_name, ward_id) on public.profiles to authenticated;

-- Location catalogue is public-readable; only trusted operator roles can configure it.
drop policy if exists "active locations readable" on public.locations;
create policy "active locations readable" on public.locations for select to anon, authenticated
using (is_active = true);
drop policy if exists "operators manage locations" on public.locations;
-- Location catalogue writes are intentionally reserved for trusted server/service-role
-- administration until a scoped location-management workflow is implemented.

-- Residents can create and view their own reports. Ward/city operators can view and update
-- only reports inside their assigned scope. `civic_issues.location_id` must identify the
-- selected ward location for ward_admin scope checks to work correctly.
drop policy if exists "resident creates own report" on public.civic_issues;
create policy "resident creates own report" on public.civic_issues for insert to authenticated
with check (reporter_id = auth.uid() and is_demo = false);
drop policy if exists "reporter or operator reads report" on public.civic_issues;
create policy "reporter or operator reads report" on public.civic_issues for select to authenticated
using (public.can_read_issue(reporter_id, location_id, state_code, city_name));
drop policy if exists "operators update reports" on public.civic_issues;
create policy "operators update reports" on public.civic_issues for update to authenticated
using (public.can_manage_issue(location_id, state_code, city_name))
with check (public.can_manage_issue(location_id, state_code, city_name));
-- Operators can update workflow fields, not rewrite the reporter or report contents.
revoke update on public.civic_issues from authenticated;
grant update (status, severity, updated_at) on public.civic_issues to authenticated;

drop policy if exists "reporter or operator reads updates" on public.issue_status_updates;
create policy "reporter or operator reads updates" on public.issue_status_updates for select to authenticated
using (exists (
  select 1 from public.civic_issues i
  where i.id = issue_id
    and public.can_read_issue(i.reporter_id, i.location_id, i.state_code, i.city_name)
));
drop policy if exists "operators add status updates" on public.issue_status_updates;
create policy "operators add status updates" on public.issue_status_updates for insert to authenticated
with check (
  actor_id = auth.uid()
  and exists (
    select 1 from public.civic_issues i
    where i.id = issue_id
      and public.can_manage_issue(i.location_id, i.state_code, i.city_name)
  )
);

-- Create a resident profile automatically after Supabase Auth signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name',''), 'resident')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- NOTE: Do not enable public/anonymous complaint listing. Public tracking should use a
-- separate rate-limited endpoint that returns only minimal fields after verifying the
-- tracking code, not direct unrestricted table access.
