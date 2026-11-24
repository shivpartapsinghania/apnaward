-- ApnaWard Migration 003: Complete civic workflow, normalized tables, Pan-India location support,
-- private evidence access for authorized operators, and privacy-safe public tracking RPC.
-- Run after 001_initial_schema.sql and 002_integrity_storage.sql in Supabase SQL Editor.

-- 1. Expand civic_issues categories and workflow statuses
alter table public.civic_issues
  drop constraint if exists civic_issues_category_check;
alter table public.civic_issues
  add constraint civic_issues_category_check
  check (category in (
    'road_damage',
    'garbage',
    'water_leakage',
    'streetlight',
    'drainage',
    'waterlogging',
    'public_safety',
    'other'
  ));

alter table public.civic_issues
  drop constraint if exists civic_issues_status_check;
alter table public.civic_issues
  add constraint civic_issues_status_check
  check (status in (
    'Submitted',
    'Reported',
    'Under Review',
    'Assigned',
    'In Progress',
    'Resolved',
    'Rejected',
    'Reopened'
  ));

alter table public.issue_status_updates
  drop constraint if exists issue_status_updates_status_check;
alter table public.issue_status_updates
  add constraint issue_status_updates_status_check
  check (status in (
    'Submitted',
    'Reported',
    'Under Review',
    'Assigned',
    'In Progress',
    'Resolved',
    'Rejected',
    'Reopened'
  ));

alter table public.issue_status_updates
  add column if not exists previous_status text;

-- 2. Departments & Issue Assignments
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  state_code text,
  city_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (code, state_code, city_name)
);

create index if not exists departments_scope_idx
  on public.departments(state_code, city_name) where is_active = true;

create table if not exists public.issue_assignments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.civic_issues(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  assigned_by uuid not null references auth.users(id) on delete restrict,
  assignee_label text not null default '',
  note text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists issue_assignments_issue_idx
  on public.issue_assignments(issue_id, created_at desc);

-- 3. Issue Attachments (metadata for private civic-evidence bucket)
create table if not exists public.issue_attachments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.civic_issues(id) on delete cascade,
  uploader_id uuid not null references auth.users(id) on delete restrict,
  storage_bucket text not null default 'civic-evidence',
  storage_path text not null unique,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  file_size_bytes integer not null check (file_size_bytes > 0 and file_size_bytes <= 5242880),
  created_at timestamptz not null default now()
);

create index if not exists issue_attachments_issue_idx
  on public.issue_attachments(issue_id, created_at desc);

-- 4. Notifications & Audit Logs
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  issue_id uuid references public.civic_issues(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx
  on public.notifications(user_id, is_read, created_at desc);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_entity_idx
  on public.audit_logs(entity_type, entity_id, created_at desc);

-- 5. Updated_at triggers for new tables
drop trigger if exists departments_set_updated_at on public.departments;
create trigger departments_set_updated_at before update on public.departments
for each row execute procedure public.set_updated_at();

drop trigger if exists issue_assignments_set_updated_at on public.issue_assignments;
create trigger issue_assignments_set_updated_at before update on public.issue_assignments
for each row execute procedure public.set_updated_at();

-- 6. Improved status change audit trigger (records previous_status + audit_logs + citizen notification)
create or replace function public.record_issue_status_change()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.issue_status_updates(issue_id, actor_id, previous_status, status, note)
    values (
      new.id,
      auth.uid(),
      old.status,
      new.status,
      'Status updated by an authorized ward operator.'
    );

    insert into public.audit_logs(actor_id, action, entity_type, entity_id, metadata)
    values (
      auth.uid(),
      'issue_status_updated',
      'civic_issues',
      new.id::text,
      jsonb_build_object(
        'tracking_code', new.tracking_code,
        'previous_status', old.status,
        'new_status', new.status
      )
    );

    insert into public.notifications(user_id, issue_id, title, message)
    values (
      new.reporter_id,
      new.id,
      'Report ' || new.tracking_code || ' updated',
      'Status changed from ' || old.status || ' to ' || new.status || '.'
    );
  end if;
  return new;
end;
$$;

-- 7. Enable RLS and define least-privilege policies for new tables
alter table public.departments enable row level security;
alter table public.issue_assignments enable row level security;
alter table public.issue_attachments enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- Departments: readable by authenticated users; managed by platform_admin
drop policy if exists "departments readable" on public.departments;
create policy "departments readable" on public.departments
for select to authenticated using (is_active = true);

drop policy if exists "platform admin manages departments" on public.departments;
create policy "platform admin manages departments" on public.departments
for all to authenticated
using (public.current_user_role() = 'platform_admin')
with check (public.current_user_role() = 'platform_admin');

-- Locations: platform_admin can manage location catalogue
drop policy if exists "platform admin manages locations" on public.locations;
create policy "platform admin manages locations" on public.locations
for all to authenticated
using (public.current_user_role() = 'platform_admin')
with check (public.current_user_role() = 'platform_admin');

-- Issue Assignments: reporter or scoped operator can read; scoped operator can insert/update
drop policy if exists "reporter or operator reads assignments" on public.issue_assignments;
create policy "reporter or operator reads assignments" on public.issue_assignments
for select to authenticated
using (exists (
  select 1 from public.civic_issues i
  where i.id = issue_id
    and public.can_read_issue(i.reporter_id, i.location_id, i.state_code, i.city_name)
));

drop policy if exists "operators manage assignments" on public.issue_assignments;
create policy "operators manage assignments" on public.issue_assignments
for insert to authenticated
with check (
  assigned_by = auth.uid()
  and exists (
    select 1 from public.civic_issues i
    where i.id = issue_id
      and public.can_manage_issue(i.location_id, i.state_code, i.city_name)
  )
);

-- Issue Attachments: uploader can insert own; reporter or scoped operator can read
drop policy if exists "reporter or operator reads attachments" on public.issue_attachments;
create policy "reporter or operator reads attachments" on public.issue_attachments
for select to authenticated
using (exists (
  select 1 from public.civic_issues i
  where i.id = issue_id
    and public.can_read_issue(i.reporter_id, i.location_id, i.state_code, i.city_name)
));

drop policy if exists "uploader inserts own attachment" on public.issue_attachments;
create policy "uploader inserts own attachment" on public.issue_attachments
for insert to authenticated
with check (
  uploader_id = auth.uid()
  and exists (
    select 1 from public.civic_issues i
    where i.id = issue_id and i.reporter_id = auth.uid()
  )
);

-- Notifications: users read and mark read only their own notifications
drop policy if exists "users read own notifications" on public.notifications;
create policy "users read own notifications" on public.notifications
for select to authenticated using (user_id = auth.uid());

drop policy if exists "users update own notifications" on public.notifications;
create policy "users update own notifications" on public.notifications
for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke update on public.notifications from authenticated;
grant update (is_read) on public.notifications to authenticated;

-- Audit Logs: platform_admin only
drop policy if exists "platform admin reads audit logs" on public.audit_logs;
create policy "platform admin reads audit logs" on public.audit_logs
for select to authenticated using (public.current_user_role() = 'platform_admin');

-- 8. Allow authorized ward/city/platform operators to read evidence photos for issues in their scope
drop policy if exists "operators read scoped evidence" on storage.objects;
create policy "operators read scoped evidence" on storage.objects
for select to authenticated
using (
  bucket_id = 'civic-evidence'
  and exists (
    select 1 from public.civic_issues i
    where i.photo_path = name
      and public.can_manage_issue(i.location_id, i.state_code, i.city_name)
  )
);

-- 9. Privacy-safe public tracking RPC (never exposes reporter_id, actor_id, or private photo_path)
create or replace function public.public_track_issue(p_tracking_code text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_issue public.civic_issues%rowtype;
  v_timeline jsonb;
begin
  if p_tracking_code is null or char_length(trim(p_tracking_code)) < 6 then
    return null;
  end if;

  select * into v_issue
  from public.civic_issues
  where upper(tracking_code) = upper(trim(p_tracking_code))
    and is_demo = false
  limit 1;

  if not found then
    return null;
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', u.id,
      'previousStatus', u.previous_status,
      'status', u.status,
      'timestamp', u.created_at,
      'event', 'Status changed'
    ) order by u.created_at asc
  ), '[]'::jsonb)
  into v_timeline
  from public.issue_status_updates u
  where u.issue_id = v_issue.id;

  return jsonb_build_object(
    'trackingCode', v_issue.tracking_code,
    'category', v_issue.category,
    'severity', v_issue.severity,
    'status', v_issue.status,
    'stateCode', v_issue.state_code,
    'districtName', v_issue.district_name,
    'cityName', v_issue.city_name,
    'wardName', v_issue.ward_name,
    'createdAt', v_issue.created_at,
    'updatedAt', v_issue.updated_at,
    'timeline', v_timeline
  );
end;
$$;

revoke all on function public.public_track_issue(text) from public;
grant execute on function public.public_track_issue(text) to anon, authenticated;

-- 10. Grants for new tables
grant select on public.departments to authenticated;
grant select, insert on public.issue_assignments to authenticated;
grant select, insert on public.issue_attachments to authenticated;
grant select on public.notifications to authenticated;
grant select on public.audit_logs to authenticated;
