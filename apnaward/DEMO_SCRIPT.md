# ApnaWard — 3-Minute Live Walkthrough

**Goal:** Demonstrate one honest resident-to-ward workflow using synthetic data only.

## 0:00–0:25 — Problem and promise

- Open Home and introduce the everyday gap: reports are scattered, progress is hard to follow and nearby repeated issues are easy to miss.
- Say: “ApnaWard brings a simple report, a shared neighbourhood view and a transparent tracking journey into one place.”

## 0:25–1:10 — Report an issue

- Open **Report an Issue**.
- Choose a sample category, enter a fictional description and select a clearly labelled demo ward.
- Show the map pin picker and EN ↔ हिंदी switch.
- Optionally attach a synthetic JPEG/PNG/WebP photo within the 5 MB limit. In a signed-in Supabase session, the UI validates the file signature and uploads it to private Storage; the complaint and attachment metadata are then saved. In local demo mode, the photo remains local to the browser.
- If Gemini is configured, show the advisory suggestion. Otherwise demonstrate manual category/severity selection.
- Submit and note the generated tracking code. Do not describe a local demo submission as a cloud save.

**Say:** “AI is optional. It suggests a possible category and urgency, but a human must review it. The report can be submitted without AI.”

## 1:10–1:50 — Shared neighbourhood view

- Open **Explore Map** and locate the new report.
- Open **Ward Analytics** and show the attention score/workload view.

**Say:** “The score is explainable triage support, not an official priority order or service guarantee.”

## 1:50–2:35 — Close the loop

- In a cloud-enabled demo, use a separately authenticated synthetic ward operator with a verified assignment to update the report. In local demo mode, demonstrate the sample workflow and clearly label it as browser-local.
- Open **Track Your Report** and enter the tracking code. The public cloud tracking API returns status-oriented fields and a reduced timeline, not reporter identity or free-text report/status notes.
- If evidence was uploaded, open the complaint as an authorized user to demonstrate its short-lived signed URL. Do not share the URL publicly.

## 2:35–3:00 — Honest scope and next step

- Say: “ApnaWard has a Supabase cloud path for resident authentication, complaint storage, private evidence and public status tracking. Verified ward datasets, trusted operator onboarding, platform-admin scope management, production security review and municipal integrations are still required before a real city deployment.”

## Backup if AI, cloud or internet is unavailable

Use the browser-local demo path, skip AI and cloud photo claims, and demonstrate the sample report/map/tracking journey. Do not claim cloud persistence, signed URL access or a successful operator authorization test unless those were actually verified in the configured test project.

## Database migration execution order

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_integrity_storage.sql`
3. `supabase/migrations/003_complete_workflow_and_rls.sql`
4. `supabase/migrations/004_resolution_proof_and_seed.sql`
5. `supabase/migrations/005_security_hardening_and_scope_lock.sql`
