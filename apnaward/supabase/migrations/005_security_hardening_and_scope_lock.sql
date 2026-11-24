-- ApnaWard Migration 005: Critical Security Hardening, Geographic Scope Lock,
-- Single-Vote Community Verification, and Resident Reopen RPC.
-- Forward-only migration: run after 004_resolution_proof_and_seed.sql.

-- 1. CRITICAL FIX: Lock down self-service profile updates so users (including ward_admin and city_admin)
-- CANNOT alter their own role or geographic scope (state_code, district_name, city_name, ward_id).
revoke update on public.profiles from authenticated;
grant update (display_name) on public.profiles to authenticated;

create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Allow a trusted database-admin session, service_role request, or platform_admin context.
  -- session_user remains the login role inside SECURITY DEFINER; current_user does not.
  if session_user in ('postgres', 'supabase_admin')
     or auth.role() = 'service_role'
     or coalesce(public.current_user_role(), '') = 'platform_admin' then
    return new;
  end if;

  if new.role is distinct from old.role
     or new.state_code is distinct from old.state_code
     or new.district_name is distinct from old.district_name
     or new.city_name is distinct from old.city_name
     or new.ward_id is distinct from old.ward_id then
    raise exception 'Only a trusted platform administrator may modify role or geographic scope.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_privileged_fields on public.profiles;
create trigger profiles_protect_privileged_fields
before update on public.profiles
for each row execute procedure public.protect_profile_privileged_fields();

-- Allow platform_admin to read and manage operator scope assignments
drop policy if exists "platform admin reads all profiles" on public.profiles;
create policy "platform admin reads all profiles" on public.profiles
for select to authenticated
using (public.current_user_role() = 'platform_admin');

-- 2. Community Verification (one verification per authenticated user per issue)
alter table public.civic_issues
  add column if not exists community_verifications integer not null default 0 check (community_verifications >= 0);

create table if not exists public.issue_verifications (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.civic_issues(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (issue_id, user_id)
);

alter table public.issue_verifications enable row level security;

drop policy if exists "users read own verifications" on public.issue_verifications;
create policy "users read own verifications" on public.issue_verifications
for select to authenticated using (user_id = auth.uid());

drop policy if exists "users verify once" on public.issue_verifications;
create policy "users verify once" on public.issue_verifications
for insert to authenticated with check (user_id = auth.uid());

grant select, insert on public.issue_verifications to authenticated;

create or replace function public.verify_civic_issue(p_tracking_code text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_issue_id uuid;
  v_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required to verify an issue.' using errcode = '42501';
  end if;

  select id into v_issue_id
  from public.civic_issues
  where upper(tracking_code) = upper(trim(p_tracking_code))
    and is_demo = false
  limit 1;

  if not found then
    raise exception 'Report not found.' using errcode = 'P0002';
  end if;

  insert into public.issue_verifications (issue_id, user_id)
  values (v_issue_id, auth.uid())
  on conflict (issue_id, user_id) do nothing;

  select count(*)::integer into v_count
  from public.issue_verifications
  where issue_id = v_issue_id;

  update public.civic_issues
  set community_verifications = v_count
  where id = v_issue_id;

  return v_count;
end;
$$;

revoke all on function public.verify_civic_issue(text) from public;
grant execute on function public.verify_civic_issue(text) to authenticated;

-- 3. Secure Resident Reopen RPC (residents may only reopen their own Resolved report)
create or replace function public.reopen_own_issue(p_tracking_code text, p_reason text default '')
returns public.civic_issues
language plpgsql
security definer
set search_path = public
as $$
declare
  v_issue public.civic_issues%rowtype;
  v_clean_reason text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  select * into v_issue
  from public.civic_issues
  where upper(tracking_code) = upper(trim(p_tracking_code))
    and is_demo = false
  limit 1;

  if not found then
    raise exception 'Report not found.' using errcode = 'P0002';
  end if;

  if v_issue.reporter_id <> auth.uid() then
    raise exception 'Only the original reporter may reopen this report.' using errcode = '42501';
  end if;

  if v_issue.status <> 'Resolved' then
    raise exception 'Only resolved reports can be reopened.' using errcode = '22023';
  end if;

  v_clean_reason := coalesce(nullif(trim(p_reason), ''), 'Reopened by resident for follow-up verification.');

  update public.civic_issues
  set status = 'Reopened', updated_at = now()
  where id = v_issue.id
  returning * into v_issue;

  insert into public.issue_status_updates(issue_id, actor_id, previous_status, status, note)
  values (v_issue.id, auth.uid(), 'Resolved', 'Reopened', v_clean_reason);

  return v_issue;
end;
$$;

revoke all on function public.reopen_own_issue(text, text) from public;
grant execute on function public.reopen_own_issue(text, text) to authenticated;


-- Permit an authenticated uploader to remove only their own evidence object.
-- This supports safe cleanup when the subsequent complaint insert fails.
drop policy if exists "citizens delete own evidence" on storage.objects;
create policy "citizens delete own evidence" on storage.objects
for delete to authenticated
using (
  bucket_id = 'civic-evidence'
  and (storage.foldername(name))[1] = auth.uid()::text
);
