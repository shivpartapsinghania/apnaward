# ApnaWard — Supabase Cloud Setup

ApnaWard supports a browser-local demo mode and an optional Supabase cloud path for authenticated reports, private evidence and public tracking. Cloud access is governed by PostgreSQL RLS and Supabase Storage policies.

## 1. Create and configure Supabase

1. Create a **disposable development/test project** first; do not use production citizen data for testing.
2. In **Project Settings → API**, copy the project URL and `anon` / publishable key.
3. Enable email/password under **Authentication → Providers → Email**. Configure redirect URLs and email confirmation for deployment.
4. Run all five migrations in this exact order in the SQL Editor:
   1. `supabase/migrations/001_initial_schema.sql`
   2. `supabase/migrations/002_integrity_storage.sql`
   3. `supabase/migrations/003_complete_workflow_and_rls.sql`
   4. `supabase/migrations/004_resolution_proof_and_seed.sql`
   5. `supabase/migrations/005_security_hardening_and_scope_lock.sql`

## 2. Configure the app

Copy `.env.example` to `.env` and set the values required for your environment:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
GEMINI_API_KEY=
PORT=3000
APP_URL=http://localhost:3000
```

The anon key is public and browser-visible; RLS is mandatory. Never put a `service_role` key in frontend variables, commit it, or include it in a release ZIP. `GEMINI_API_KEY` is server-side only.

## 3. Verify authentication and complaint workflow

1. Run `npm install`, `npm run typecheck`, `npm test` and `npm run build`.
2. Start with `npm run dev` and open `http://localhost:3000`.
3. Create a synthetic resident account and sign in.
4. Submit a synthetic complaint with and without a photo. Verify the complaint row, `photo_path`, and `issue_attachments` metadata.
5. Sign in as a second synthetic resident and verify that the first resident's complaint and private evidence are not readable.
6. Use separately created synthetic ward/city operator accounts with verified location assignments to test scoped access and signed URL issuance.
7. Test `/api/public/track/:trackingCode` with a valid synthetic tracking code and verify that the response contains no reporter identity, free-text title/description/notes, coordinates or evidence paths.
8. Test invalid file signatures, unsupported MIME types, files over 5 MB, upload failure, definite complaint-insert rejection, attachment-metadata rejection and ambiguous network timeouts. For an ambiguous timeout, inspect the synthetic tracking code and storage/attachment records before retrying.

## 4. Security and administration model

- The signup trigger creates resident profiles. Residents, ward admins and city admins cannot self-change role or assigned geography: migration 005 revokes general profile updates, grants only `display_name`, and adds a defensive trigger; `/api/me` also rejects privileged fields.
- Ward/city report access is scoped by RLS and assigned geography. Do not treat demo ward labels as verified operator assignments.
- `platform_admin` can read all profiles, but the current app/API does not implement a privileged scope-management endpoint. The trigger's `platform_admin` exception does not override SQL column grants or RLS. Until such an endpoint is independently reviewed, use a trusted Supabase SQL Editor/database-admin workflow for role and scope assignment. Never expose service-role credentials.
- Evidence is stored in the private `civic-evidence` bucket (5 MB; JPEG/PNG/WebP). The UI validates file signatures, uploads with the signed-in user's token, records attachment metadata, and requests a one-hour signed URL for display. Storage RLS authorizes the uploader and appropriately scoped operators.
- Public tracking is implemented through `/api/public/track/:trackingCode` and `public_track_issue`. It returns a reduced status timeline without free-text notes or reporter PII. The route is rate-limited in-process; this is not a distributed rate limiter.
- Browser auth tokens are currently stored in localStorage. Review session isolation and use a stronger BFF/session design before a high-assurance public launch.

## 5. Location data and deployment boundary

The schema supports India → State → District → City → Ward → Locality. The bundled state/UT catalogue is a selector foundation; verified district/city/ward catalogues and boundary GeoJSON must be imported from authoritative sources. Demo coordinates and ward labels are illustrative, not official coverage. No municipal integration or government endorsement is implied.

## 6. Known limitations

The repository includes automated local unit/regression tests, but it does not include a configured disposable Supabase instance or live API credentials. Therefore database migration execution, live Auth/RLS authorization, Storage signed-URL access, cross-ward isolation and real cloud upload failure scenarios must still be tested in an isolated Supabase project. Do not test with production citizen data.
