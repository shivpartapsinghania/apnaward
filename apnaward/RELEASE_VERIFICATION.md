# ApnaWard v2 — Release Verification Report

## Scope

Targeted corrections only. The existing React/Vite/Express/Supabase architecture, app identity and feature set were preserved; the project was not rebuilt from scratch.

## Changes

- Updated `SECURITY_NOTES.md`, `SUPABASE_SETUP.md`, `README.md`, `SUBMISSION_CHECKLIST.md`, `DEMO_SCRIPT.md` and `JUDGE_QA.md` to reflect current implementation and limitations.
- Standardized migration execution order as 001 → 002 → 003 → 004 → 005 in all six documents.
- Tightened the public tracking RPC projection: removed free-text complaint title and status notes; the public timeline now contains status events and timestamps only.
- Documented the platform-admin limitation accurately: profile read access exists, but no app/API workflow currently grants scope-management capability. Trusted database administration remains required.
- Added a Storage delete policy limited to each authenticated uploader's own evidence folder for safe cleanup attempts.
- Added evidence cleanup after a definite complaint insert rejection. For ambiguous network failures, cleanup is intentionally skipped because the database may already have committed the complaint.
- On definite attachment metadata rejection, the app attempts object cleanup and clears the complaint's photo path; it surfaces a warning while retaining the complaint. Ambiguous attachment outcomes are surfaced for reconciliation.
- Removed the local data-URL substitution for cloud complaints; cloud evidence display uses the authorized signed-URL path.
- Expanded tests for actual offline-outbox operations, public tracking privacy projection and evidence workflow wiring.

## Commands and actual results

Environment: Node.js `v22.16.0`, npm `10.9.2`.

| Command | Result | Details |
|---|---|---|
| `npm install --no-audit --no-fund` | **Blocked** | npm registry DNS failed (`EAI_AGAIN registry.npmjs.org`); install did not complete. |
| `npm run typecheck` | **Not passed** | TypeScript stopped because `vite/client` type definitions are unavailable; dependencies could not be installed. |
| `npm test` | **Passed** | 12 tests passed, 0 failed. Includes offline outbox behavior, public tracking privacy regression and evidence integration checks. |
| `npm run build` | **Not passed** | `vite: not found`; dependencies were unavailable. |

## Not executed

- Live Express API integration tests requiring installed app dependencies.
- Supabase Auth, PostgreSQL RLS, migration execution and cross-role authorization tests.
- Real Storage upload, signed-URL authorization and failure-injection tests.
- Browser/E2E tests and production deployment smoke tests.

No production citizen data was used. No live Supabase project or disposable integration credentials were supplied. Source-level regression tests do not substitute for live database/API authorization tests.

## Security findings and limitations

- Residents and ward/city administrators cannot self-change role or geographic assignment through the authenticated profile update grants and `/api/me` route.
- Public tracking now excludes reporter IDs, titles, descriptions, free-text status notes, coordinates and evidence paths.
- Evidence remains in a private bucket; Storage RLS controls access and signed URLs are short-lived.
- `platform_admin` does not have an application/API scope-management workflow in this release. Use trusted Supabase SQL Editor/database-admin operations for role/scope assignment; never expose service-role credentials.
- In-process rate limiting is not distributed. Browser auth uses localStorage. Ward data and operator assignments require authoritative verification. Privacy/retention, monitoring, independent RLS review and production session hardening remain required.
- An ambiguous network timeout can leave a cloud write's outcome uncertain. The app surfaces that condition and avoids unsafe evidence deletion; operators should inspect the tracking code and database/storage records before retrying.

## Run and deployment commands

Requires Node.js `>=20.19.0` and a network connection to install dependencies.

```bash
cp .env.example .env
# Configure VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, optional GEMINI_API_KEY,
# PORT and APP_URL. Never put a service_role key in the browser or VITE_* variables.
npm install
npm run typecheck
npm test
npm run build
npm run start
```

For development, use `npm run dev`. Apply Supabase migrations in this order before enabling cloud features:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_integrity_storage.sql`
3. `supabase/migrations/003_complete_workflow_and_rls.sql`
4. `supabase/migrations/004_resolution_proof_and_seed.sql`
5. `supabase/migrations/005_security_hardening_and_scope_lock.sql`

## Release decision

The source/test/documentation package is prepared, but this environment could not complete dependency installation, typechecking or production build because npm registry DNS was unavailable. Do not represent this archive as a fully build-verified or production-security-certified release until those commands and isolated Supabase integration tests pass in a network-enabled environment.
