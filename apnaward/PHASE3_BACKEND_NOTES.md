# ApnaWard — Phase 3 Backend Upgrade

## Implemented in this package

- Added an optional Supabase resident account flow (email/password sign-up and sign-in) without adding a new frontend dependency.
- Added refresh-token handling for expired access sessions.
- Added authenticated cloud report creation and report loading through Supabase REST, with the existing browser demo mode preserved.
- Added cloud status update requests. Failed/unauthorized cloud status changes are reverted locally and shown as a warning.
- Added a second SQL migration for database-managed `updated_at`, automatic initial/status-change audit events, least-privilege grants, and a private evidence bucket with a 5 MB image allowlist.
- Added collision-resistant tracking-code suffixes for reports created on different devices.
- Updated Supabase setup, security notes, judge Q&A and demo script to reflect the actual integration boundaries.

## Checks performed

- ZIP source archive integrity checked before editing.
- 36 TypeScript/TSX source files transpiled with the installed TypeScript compiler in syntax-check mode: zero syntax diagnostics.
- `package.json` parsed successfully.
- Final ZIP integrity tested after packaging.

## Checks not completed

- Full `npm run typecheck` / `npm run build` could not be run because dependencies were not installed; package installation timed out in this environment.
- No Supabase project credentials were supplied, so migrations, email confirmation, RLS behavior, cross-device sync and account flows were not live-tested.
- No Microsoft hackathon problem statement or scoring rubric was supplied, so this is a general civic-tech engineering upgrade rather than a claim of compliance with a specific Microsoft event track.

## Still required before a public launch

- Run both migrations in a disposable Supabase project and execute the resident/operator RLS test matrix.
- Provision trusted operator accounts and verified ward/city `locations` records. Demo ward labels are not official location IDs.
- Wire the report form's photo upload to the private bucket and implement authorized evidence reads.
- Add a privacy-safe tracking endpoint, abuse controls backed by shared storage, automated tests, monitoring, backup/retention rules and a reviewed privacy notice.
- Use real credentials only in local environment secrets; never put a Supabase service-role key in the browser or ZIP.
