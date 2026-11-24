# ApnaWard — Your Neighbourhood. Your Voice.

**Small reports. Better neighbourhoods.**

ApnaWard is a bilingual (English + Hindi) civic-tech prototype for reporting neighbourhood infrastructure issues, viewing reports on a map and following status changes with a tracking code. Residents can optionally sign in to Supabase for cloud reports and private photo evidence. Authorized Ward, City and Platform Administrators have role-aware workflows, subject to configured database permissions and verified geographic assignments.

## Architecture

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Leaflet, Lucide Icons and Motion.
- **Backend:** Express (`server.ts`) with security headers, CORS validation, safe request logging and rate limits. Routes include `/api/health`, `/api/locations`, `/api/public/track/:trackingCode`, `/api/me`, `/api/issues`, status/verification/reopen endpoints and `/api/analyze-issue`.
- **Database/Auth/Storage:** Supabase PostgreSQL, Auth and private `civic-evidence` Storage bucket, governed by five ordered SQL migrations.
- **AI:** Optional server-side Gemini assistance for preliminary category/severity suggestions and image assessment. AI is advisory; manual reporting works without a Gemini key.
- **Demo mode:** Browser-local sample mode remains available when cloud configuration/sign-in is absent. A cloud write failure is not silently converted into a cloud success.

## Features and workflow

- Civic categories: `road_damage`, `garbage`, `water_leakage`, `streetlight`, `drainage`, `waterlogging`, `public_safety`, `other`.
- Workflow statuses: `Submitted`, `Reported`, `Under Review`, `Assigned`, `In Progress`, `Resolved`, `Rejected`, `Reopened`.
- India location hierarchy: State/UT → District → City/Municipality → Ward → Locality. Bundled sample labels/coordinates are illustrative until authoritative data is configured.
- Roles: `resident`, `ward_admin`, `city_admin`, `platform_admin`. Public signup creates residents; role and geographic assignments are not self-service fields.
- **Public tracking:** `/api/public/track/:trackingCode` calls the `public_track_issue` RPC and returns a reduced status timeline. It omits reporter identity, free-text report title/description/status notes, coordinates and evidence paths.
- **Evidence:** the signed-in report UI validates JPEG/PNG/WebP file signatures and the 5 MB size limit, uploads to private Storage, writes `issue_attachments` metadata and displays authorized evidence through a one-hour signed URL. Definite insert failures trigger best-effort cleanup; ambiguous network outcomes are surfaced for reconciliation to avoid deleting an object that may belong to a committed report. Storage RLS remains authoritative.
- **Offline:** the offline outbox stores drafts locally when the browser is offline. This is not a complete automatic cloud-sync guarantee; queued drafts remain local until a supported sync path processes them.

## Environment

Requires **Node.js >= 20.19.0**.

Copy `.env.example` to `.env` and configure:

```env
GEMINI_API_KEY=                  # Optional; server-side only
PORT=3000
APP_URL=http://localhost:3000
VITE_SUPABASE_URL=               # Supabase project URL
VITE_SUPABASE_ANON_KEY=          # Public anon/publishable key; RLS required
```

Never expose `GEMINI_API_KEY` or a Supabase `service_role` key in `VITE_*` variables or frontend code.

## Database setup — execute all five migrations in this order

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_integrity_storage.sql`
3. `supabase/migrations/003_complete_workflow_and_rls.sql`
4. `supabase/migrations/004_resolution_proof_and_seed.sql`
5. `supabase/migrations/005_security_hardening_and_scope_lock.sql`

See `SUPABASE_SETUP.md` for isolated setup and verification instructions.

## Install, test, build and run

```bash
npm install
npm run typecheck
npm test
npm run build
npm run dev       # development server
npm run start     # production server after build
```

`npm test` runs the local Node test suite. It does not replace live Supabase Auth, RLS, Storage or API integration testing.

## Security and known limitations

- Residents and ward/city admins cannot self-change role or geographic assignments. `platform_admin` can read profiles, but this release does not provide an application/API workflow to change another user's role or scope. Use a trusted Supabase database-admin workflow until a reviewed server-side management endpoint exists; never ship service-role credentials.
- Public tracking is rate-limited per server process and exposes only status-oriented, non-free-text fields. Use high-entropy tracking codes; this endpoint is not a substitute for a complete anti-enumeration program.
- Auth tokens are stored in browser localStorage in this prototype. A stronger session/BFF design and independent security review are required before public launch.
- Offline drafts are browser-local; automatic conflict-safe background synchronization is not claimed.
- Verified ward boundaries, production operator mapping, distributed rate limiting, privacy/retention processes, monitoring and municipal integrations remain deployment work.
- No government approval, partnership, official endorsement or all-India operational network is claimed.
