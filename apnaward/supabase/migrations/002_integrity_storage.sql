-- ApnaWard Phase 3: workflow integrity, timestamps and private evidence storage.
-- Run after 001_initial_schema.sql in the Supabase SQL editor.

-- Keep updated_at reliable regardless of which trusted client performs a workflow update.
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public
as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists civic_issues_set_updated_at on public.civic_issues;
create trigger civic_issues_set_updated_at before update on public.civic_issues
for each row execute procedure public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute procedure public.set_updated_at();

-- Every new report starts with an immutable-by-client audit event.
create or replace function public.record_initial_issue_status()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.issue_status_updates(issue_id, actor_id, status, note)
  values (new.id, new.reporter_id, new.status, 'Report submitted.');
  return new;
end; $$;

drop trigger if exists civic_issue_initial_status on public.civic_issues;
create trigger civic_issue_initial_status after insert on public.civic_issues
for each row execute procedure public.record_initial_issue_status();

-- Status changes always create an audit event. The update policy already scopes
-- who can change a report; this trigger records the authenticated actor.
create or replace function public.record_issue_status_change()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  if new.status is distinct from old.status then
    insert into public.issue_status_updates(issue_id, actor_id, status, note)
    values (new.id, auth.uid(), new.status, 'Status updated by an authorized ward operator.');
  end if;
  return new;
end; $$;

drop trigger if exists civic_issue_status_audit on public.civic_issues;
create trigger civic_issue_status_audit after update of status on public.civic_issues
for each row execute procedure public.record_issue_status_change();

-- Explicit least-privilege grants. RLS remains the row-level enforcement layer.
grant select on public.profiles to authenticated;
grant select on public.locations to anon, authenticated;
grant select, insert on public.civic_issues to authenticated;
grant update (status, severity, updated_at) on public.civic_issues to authenticated;
-- Clients must not forge audit events directly; only database triggers write them.
revoke insert, update, delete on public.issue_status_updates from anon, authenticated;
grant select on public.issue_status_updates to authenticated;

-- Private photo bucket. Files are readable only by the authenticated uploader
-- (operator evidence access can be added after report-to-file ownership mapping is enabled).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('civic-evidence', 'civic-evidence', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "citizens upload own evidence" on storage.objects;
create policy "citizens upload own evidence" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'civic-evidence'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "citizens read own evidence" on storage.objects;
create policy "citizens read own evidence" on storage.objects
for select to authenticated
using (
  bucket_id = 'civic-evidence'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- No anonymous issue reads and no client-side role elevation are introduced here.
