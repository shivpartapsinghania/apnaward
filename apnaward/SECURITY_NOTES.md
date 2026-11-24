# ApnaWard — Security Notes

## Implemented controls

- Gemini credentials are read only by the Express server from `GEMINI_API_KEY`; no service-role key is shipped to the browser.
- API responses use `Cache-Control: no-store`; Express applies security headers, strict CORS checks and endpoint rate limits. The public tracking route has its own per-process rate limit.
- Supabase Auth creates new profiles with the `resident` role. Migration 005 revokes authenticated users' general profile UPDATE privilege and grants only `display_name`; the trigger rejects changes to role and geographic scope unless the database request is made by `service_role` or a `platform_admin`.
- `/api/me` independently rejects self-service changes to `role`, `state_code`, `district_name`, `city_name` and `ward_id`.
- Ward/city issue access and workflow changes are constrained by RLS and assigned geography. Public signup cannot self-assign operator roles.
- `GET /api/public/track/:trackingCode` is implemented. Its RPC returns tracking code, category, severity, status, non-personal geographic labels, timestamps and status-only timeline events. It does not return reporter identifiers, title, description, free-text status notes, email, phone, coordinates or storage paths.
- Evidence upload is wired into the authenticated report submission UI. The browser checks JPEG/PNG/WebP file signatures and the 5 MB limit, uploads to the private `civic-evidence` bucket, stores the object path on the complaint and inserts attachment metadata. Authorized users request a one-hour signed URL; Supabase Storage RLS decides whether the user may read the object.
- Migration 005 permits an authenticated uploader to delete only evidence objects in their own user-ID folder. The client attempts cleanup after a definite complaint-insert rejection; it deliberately avoids deletion when a network timeout makes the database commit uncertain. If attachment metadata is definitely rejected, it attempts object cleanup and clears the complaint photo path. An ambiguous network result is surfaced for manual reconciliation rather than reported as success.

## Administrative scope limitation

`platform_admin` can read profiles and the schema's location/departments policies recognize that role, but the current authenticated grants and profile RLS policies do **not** provide a supported application/API workflow for changing another user's role or geographic assignment. Migration 005's trigger contains a trusted `platform_admin` exception, but that exception alone does not grant the SQL UPDATE privilege. Until a reviewed privileged server-side administration endpoint or controlled SQL-operator process is added, assign roles and scopes only through the Supabase SQL Editor using the trusted database administrator context. Never expose a service-role credential to the client or place it in `VITE_*` variables.

## Remaining limitations / pre-production work

- No isolated Supabase integration environment was supplied; RLS, Storage policies, public RPC and auth flows still require execution against a disposable Supabase project before production use.
- Browser auth tokens are stored in localStorage in this lightweight prototype; complete a separate session-security review before public launch.
- The in-memory rate limiter is per process and is not suitable as a distributed abuse-control mechanism.
- Add durable monitoring, audit review, CAPTCHA/risk controls, privacy notice, consent, retention/deletion process and incident response.
- Verify ward boundaries, location IDs and operator assignments against authoritative local-body data.
- Independently review SQL/RLS and test cross-ward/cross-city access with synthetic accounts.
- Public tracking uses a tracking code as a bearer lookup secret; rate limiting reduces but does not eliminate enumeration risk. Use high-entropy tracking codes and consider additional proof-of-possession before broad public launch.

## Secret handling

Never put a Supabase `service_role` key or Gemini API key in frontend code, a committed `.env`, screenshots, public issue reports or the repository. The Supabase anon/publishable key is intended for client use only when RLS is correctly configured.

## Database migration execution order

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_integrity_storage.sql`
3. `supabase/migrations/003_complete_workflow_and_rls.sql`
4. `supabase/migrations/004_resolution_proof_and_seed.sql`
5. `supabase/migrations/005_security_hardening_and_scope_lock.sql`
