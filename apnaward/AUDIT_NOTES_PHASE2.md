# ApnaWard — Phase 2 Engineering Notes

## Changes in this package

1. Renamed the package from the template name to `apnaward` and set version `1.0.0`.
2. Fixed the production start command to use `tsx server.ts`; `tsx` is a production dependency because the start script needs it at runtime.
3. Added a cross-platform clean script and explicit typecheck/check commands.
4. Added basic Express security headers, a 9 MB JSON request limit, JSON content-type validation, consistent malformed-JSON responses and an in-memory per-IP limit of 12 AI requests per 10 minutes.
5. Hardened the Supabase foundation: operator report access is scoped by assigned ward or city, profile reads are self-only, location-catalogue writes are not granted to all operators, and operator report updates are restricted to workflow columns.
6. Added judge Q&A, submission checklist, pan-India data onboarding plan and security notes. Rewrote the live demo script so it does not overstate cloud sync or AI availability.
7. Clarified that the current app remains localStorage-based and that Supabase frontend auth/sync are not yet implemented.

## Checks performed

- Parsed `package.json` as JSON.
- Transpiled all 34 TypeScript/TSX files with the installed TypeScript compiler in syntax-check mode: no syntax diagnostics.
- Checked key SQL policy invariants by source inspection.
- ZIP integrity will be checked after packaging.

## Checks not completed

- `npm install` did not complete within the available execution window; dependencies are not installed in this workspace.
- Therefore `npm run lint`, `npm run build`, live server startup, browser interaction, Gemini API calls and Supabase migration execution were **not** verified here.
- The SQL migration still requires a real Supabase test project and independent RLS review before any real user data is stored.

## Remaining product work

- Wire Supabase Auth into the React app.
- Replace the localStorage repository with a Supabase-backed repository and preserve an explicit demo mode.
- Map reports to verified ward-level `locations.id` values.
- Add a privacy-safe, rate-limited public tracking endpoint.
- Add integration tests and deployment monitoring.
