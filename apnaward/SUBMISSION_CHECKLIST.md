# ApnaWard — Submission & Release Checklist

## Build and local verification

- [ ] Use Node.js >= 20.19.0.
- [ ] Run `npm install`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `npm run build` and confirm `dist/` is generated.
- [ ] Start with `npm run dev`; open `http://localhost:3000`.
- [ ] Open `/api/health` and confirm `status: "ok"`.
- [ ] Confirm demo mode is visible when cloud is not configured and use only illustrative data.
- [ ] Test manual report creation, map visibility and local tracking.
- [ ] If Supabase is configured, test resident sign-in, cloud complaint creation, public tracking and a scoped operator status update with synthetic accounts.
- [ ] If testing photo evidence, verify the UI upload, private object, attachment metadata and authorized signed URL. Test invalid signatures and over-limit files.
- [ ] Test Hindi/English switching and at least one desktop and one mobile viewport.
- [ ] If Gemini is configured, test one advisory suggestion; otherwise confirm manual reporting remains usable.
- [ ] Do not use real residents' names, phone numbers, addresses or private photos.

## Isolated cloud/security verification (required before production)

- [ ] Apply migrations 001 → 002 → 003 → 004 → 005 to a disposable Supabase project, never a production citizen-data project.
- [ ] Verify resident, ward-admin and city-admin self-service attempts to alter role/geographic scope are rejected.
- [ ] Verify cross-resident and cross-ward RLS denials using synthetic accounts.
- [ ] Verify public tracking omits reporter PII, free-text title/description/status notes, coordinates and evidence paths.
- [ ] Verify evidence is private and signed URLs are issued only to authorized users.
- [ ] Exercise upload success, complaint insert failure, attachment metadata failure and cleanup behavior.
- [ ] Assign operator scopes only through a trusted database-admin process; the current app has no platform-admin scope-management endpoint.

## Submission package

- [ ] Include source, all five migrations, tests and updated documentation.
- [ ] Exclude `node_modules`, `.env`, API keys and other secrets.
- [ ] Add a live demo URL only after deployment and independent verification.
- [ ] Add a demo video URL only after upload and playback verification.
- [ ] Label sample locations and sample complaints as illustrative.

## Do not claim

- A live all-India municipal network, verified nationwide ward boundaries or government endorsement.
- Municipal API integration or official partnership.
- Automatic offline cloud synchronization or conflict resolution.
- A production-ready platform-admin role/scope management console.
- Successful cloud evidence or RLS tests unless they were run against an isolated Supabase project.
- AI-confirmed facts, verified hazards or autonomous dispatch.

## Database migration execution order

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_integrity_storage.sql`
3. `supabase/migrations/003_complete_workflow_and_rls.sql`
4. `supabase/migrations/004_resolution_proof_and_seed.sql`
5. `supabase/migrations/005_security_hardening_and_scope_lock.sql`
