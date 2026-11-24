# ApnaWard Phase 1 upgrade notes

## Added
- `supabase/migrations/001_initial_schema.sql`: initial PostgreSQL schema, auth profile trigger, location hierarchy, issue records, status history, indexes, and RLS policies.
- `src/data/indiaLocations.ts`: Indian States/UTs catalogue and generic location record types.
- `SUPABASE_SETUP.md`: setup steps, configuration, roles, and limitations.
- `.env.example`: Supabase URL and anon-key placeholders; no secrets.

## Security choices
- Public users cannot read the full complaints table.
- Residents can insert only reports attributed to their own authenticated account and cannot insert demo rows.
- Resident profile update grants exclude the `role` column.
- Public signup always creates a `resident` role. Admin roles require trusted manual promotion.

## Not yet implemented
- React login/signup UI and session lifecycle.
- Wiring the current issue store from localStorage to database CRUD.
- Ward-scoped admin permissions and public tracking endpoint.
- Admin location configuration screens and verified ward boundaries.

## Validation
- Source files and SQL migration were reviewed statically.
- No live Supabase project credentials were supplied, so database migration execution, authentication, RLS runtime tests, and cross-device sync have not been verified.
- Dependency installation is not available in this environment; a production build could not be re-run.
