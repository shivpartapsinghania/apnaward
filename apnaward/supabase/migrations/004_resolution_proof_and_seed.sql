-- ApnaWard Migration 004: Resolution Before/After photo proof & optional illustrative demo location seed.
-- Run after 003_complete_workflow_and_rls.sql in Supabase SQL Editor.

alter table public.civic_issues
  add column if not exists resolution_photo_path text;

alter table public.issue_attachments
  add column if not exists proof_type text not null default 'citizen_evidence'
  check (proof_type in ('citizen_evidence', 'ward_resolution'));

-- Allow authorized operators to update resolution_photo_path alongside status/severity
grant update (status, severity, resolution_photo_path, updated_at) on public.civic_issues to authenticated;

-- Allow authorized operators to upload resolution proof photos into civic-evidence/{user_id}/...
drop policy if exists "operators read resolution evidence" on storage.objects;
create policy "operators read resolution evidence" on storage.objects
for select to authenticated
using (
  bucket_id = 'civic-evidence'
  and exists (
    select 1 from public.civic_issues i
    where (i.photo_path = name or i.resolution_photo_path = name)
      and public.can_read_issue(i.reporter_id, i.location_id, i.state_code, i.city_name)
  )
);

-- Optional illustrative sample locations (clearly flagged is_demo = true)
-- so a fresh Supabase project has working multi-city Pan-India dropdowns out of the box.
with ka_dist as (
  insert into public.locations (parent_id, level, name, state_code, is_active, is_demo)
  values (null, 'district', 'Bengaluru Urban (Demo)', 'KA', true, true)
  on conflict (parent_id, level, name) do update set is_active = true
  returning id
),
ka_city as (
  insert into public.locations (parent_id, level, name, state_code, latitude, longitude, is_active, is_demo)
  select id, 'city', 'Bengaluru (Demo)', 'KA', 12.9716, 77.5946, true, true from ka_dist
  on conflict (parent_id, level, name) do update set is_active = true
  returning id
)
insert into public.locations (parent_id, level, name, state_code, latitude, longitude, is_active, is_demo)
select id, 'ward', w.name, 'KA', w.lat, w.lng, true, true
from ka_city,
(values
  ('Ward 1 · North Market (Demo)', 12.9815, 77.5946),
  ('Ward 2 · Station Road (Demo)', 12.9762, 77.5713),
  ('Ward 3 · Riverside Colony (Demo)', 12.9668, 77.6062)
) as w(name, lat, lng)
on conflict (parent_id, level, name) do nothing;
