# ApnaWard — Judge Q&A Notes

Use these answers as a truthful guide. Separate implemented prototype behavior from deployment work.

## 1. What problem are you solving?
Residents often report potholes, waste overflow, water leaks, damaged streetlights and drainage issues through disconnected channels. It is difficult to follow progress, compare urgency or notice repeated problems nearby.

## 2. What is ApnaWard?
A bilingual civic issue-reporting prototype connecting a resident report flow with a map, explainable priority scoring, status updates and complaint tracking.

## 3. What is implemented end to end?
The browser-local demo supports report creation, map display and tracking. With Supabase configured, signed-in residents can create/load cloud reports. The public tracking route and privacy-reduced RPC are implemented. A separately assigned operator can update reports when RLS and geographic mappings permit it.

## 4. Does it support photo evidence?
Yes. The signed-in report UI validates JPEG/PNG/WebP file signatures and a 5 MB limit, uploads to the private `civic-evidence` bucket, writes attachment metadata and the complaint's storage path, and requests a one-hour signed URL when an authorized user views the evidence. Local demo photos remain browser-local. Live Storage authorization and failure cases still need verification in a disposable Supabase project.

## 5. What does public tracking reveal?
The API returns a tracking code, category, severity, status, non-personal geographic labels, timestamps and status-only timeline events. It intentionally omits reporter identity, free-text title/description/status notes, coordinates and evidence paths. The route has an in-process rate limit; a distributed anti-enumeration strategy remains future work.

## 6. How does prioritization work?
The prototype uses an explainable 0–100 attention score based on severity, potential public impact and waiting time. It is a triage aid, not an official service-level agreement or automated government decision.

## 7. What does AI do?
If a server-side Gemini key is configured, the helper suggests category, severity, explanation and possible public impact. It is advisory and requires human review. Manual reporting works without AI.

## 8. How do you prevent role or geography self-escalation?
Public signup creates resident profiles. Migration 005 revokes general authenticated profile updates, grants only `display_name`, and uses a trigger to reject changes to role and assigned geography unless the request is trusted. `/api/me` also rejects privileged fields. Ward/city operators are restricted by RLS and geography.

## 9. Can platform_admin manage ward/city assignments in the app?
Not in this release. `platform_admin` can read profiles, but there is no supported app/API scope-management endpoint and the current authenticated grants do not let that role update privileged profile columns. Until a reviewed server-side management workflow is added, trusted database administrators must assign roles/scopes through the Supabase SQL Editor. The service-role key is never exposed to the browser.

## 10. Is the system live across India?
No. The schema supports a State → District → City → Ward → Locality hierarchy. The bundled catalogue is only a starting point; verified local-body and ward data must be sourced and configured city by city.

## 11. Is data stored in the cloud?
When a Supabase project is configured and a resident signs in, cloud complaint creation/loading is supported. Demo records and fallback mode remain browser-local. Cross-device cloud behavior and operator RLS must be tested against the target project before claiming a live operational deployment.

## 12. What happens if internet is unavailable?
The offline outbox can save a local draft in the browser. This release does not claim automatic background synchronization, conflict resolution or guaranteed cloud delivery of queued drafts.

## 13. Can it integrate with municipal systems?
Potentially, through approved APIs or authorized workflows, but no municipal integration is active. Integration requires permission, data contracts, operational ownership and local-body coordination.

## 14. What remains before production?
Run all five migrations and automated authorization tests against an isolated Supabase project; verify auth, RLS, private Storage and upload failure cleanup; complete independent SQL/security review; add robust distributed rate limiting, session hardening, privacy/retention and incident response; verify ward data and operator assignments; and pilot with a consenting local body.

## Database migration execution order

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_integrity_storage.sql`
3. `supabase/migrations/003_complete_workflow_and_rls.sql`
4. `supabase/migrations/004_resolution_proof_and_seed.sql`
5. `supabase/migrations/005_security_hardening_and_scope_lock.sql`
