# ApnaWard — Project Context & Technical Reference

## 1. Completed Features

- **Home & Community Story (`HomePage` + `ApnaWardVisuals`):**
  - Welcoming light-surface hero with bespoke neighbourhood illustration (`NeighbourhoodHeroScene`), clickable 6-category reporting cards, 5-stage workflow explainer, interactive 9-step illustrative road-damage scenario (`AW-DEMO-RD01`), Deep Navy **Your Ward at a Glance** dashboard preview, embedded interactive **Explore Map** Leaflet preview, community participation artwork (`CommunityParticipationVisual`), platform workspace cards, and **Community Trust & Transparency** Q&A.
- **Citizen Issue Reporting (`ReportIssuePage` + `LocationPickerMap`):**
  - 3-step validated workflow (`What happened?` → `Where did you notice it?` → `Submit your report.`).
  - Supports 6 categories (`road_damage`, `garbage`, `water_leakage`, `streetlight`, `drainage`, `public_safety`).
  - Client-side photo upload validation (`image/*`, `<= 15 MB`) and Canvas JPEG compression (`<= 960px`, quality `0.8`).
  - Optional browser voice dictation in English (`en-IN`) and Hindi (`hi-IN`) via Web Speech API (`src/utils/speechRecognition.ts`).
  - Duplicate report detection using Haversine distance (`<= 450m`), Unicode-aware token similarity (`\p{L}\p{N}`), and matching category/ward signals (`src/utils/duplicates.ts`).
  - Double-submission prevention (`submittingRef` synchronous lock + 10-second exact-payload duplicate guard in `App.tsx`) and sequential unique `AW-YYYY-NNN` ID generation.
- **Server-Side AI Analysis (`server.ts` `/api/analyze-issue` + `AiInspectorPage`):**
  - Uses `@google/genai` (`gemini-4-hydrogen`) strictly on the server.
  - Accepts report text + optional base64 image (`image/jpeg`, `image/png`, `image/webp`, capped at 8 MB base64 with HTTP `413` protection and trimmed text length limits).
  - Returns structured JSON (`category`, `severity`, `explanation`, `publicImpact`, `recommendedAction`, `imageAssessment`, `disclaimer`).
  - Retries once on transient `503`/`UNAVAILABLE`, maps `403`/`429`/`503` cleanly, and allows full manual submission when AI is unavailable.
- **What Needs Attention First (`src/utils/priority.ts` + `SmartPriorityPage`):**
  - Rule-based `0–100` score: Urgency (`10–45`), Community Impact (`8–35`), Waiting Time (`4–20`), with explicit human-readable reasoning and band (`Critical`, `High`, `Elevated`, `Standard`).
- **Explore Map (`LiveMapPage`):**
  - Leaflet map with OpenStreetMap standard tiles, distinct SVG category icons, status-coded indicators (`Reported`, `In Progress`, `Resolved`), multi-facet filters (category, status, ward, urgency, search), crisp light marker popups, **Areas Needing Attention** zone focusing, and `ResizeObserver` tile invalidation.
- **Ward Operations & Analytics (`CommandCenterPage`, `OverviewPage`):**
  - Balanced Deep Navy administrative dashboards with unified KPIs (Total, Pending Reports, In Progress, High/Critical Open, Resolved, Resolution Rate), category breakdown, ward comparison, Haversine spatial clustering (`src/utils/hotspots.ts`), and recent activity stream.
- **Community Reports & Closed-Loop Tracking (`IssueManagementPage`, `IssueDetailDrawer`, `ComplaintTrackingPage`):**
  - Priority/date-sortable queue, slide-over detail drawer with photo/map/AI note/attention breakdown, status updates with public ward notes, one-click **Mark as Resolved**, and timestamped timeline reflected across every view.
- **Bilingual Support (`src/i18n/translations.ts`, `src/i18n/homeTranslations.ts`, `LanguageContext.tsx`):**
  - Live `EN | हिंदी` switching across all pages, modals, and tours while keeping `AW-YYYY-NNN` IDs untranslated.
- **Guided Demos (`GuidedProductTour`, `JudgePresentationModal`, `CitizenOnboardingModal`):**
  - 6-step 60-Second Tour and 7-chapter Guided Demo with live screen jumps and floating Resume control.

---

## 2. Architecture & File Map

| Layer | File(s) | Responsibility |
| :--- | :--- | :--- |
| **Server & API** | `server.ts` | Express server (`PORT \|\| 3000`), `/api` security headers (`nosniff`, `no-store`), `/api/health`, `/api/analyze-issue` (Gemini SDK proxy), Vite dev middleware / `dist` SPA serving |
| **App Shell** | `src/App.tsx`, `src/main.tsx`, `src/index.css`, `index.html` | Navigation state, shared `issues` source of truth, `DEMO MODE` badge, Guided Demo & Tour orchestration, mobile drawer + bottom bar, design tokens & Tailwind v4 |
| **Brand Assets** | `src/components/ApnaWardLogo.tsx`, `src/components/ApnaWardVisuals.tsx` | Minimal location-pin + home emblem and editorial Indian neighbourhood SVG illustrations |
| **Core Types & Seed** | `src/types/civic.ts`, `src/data/demoIssues.ts` | `CivicIssue`, `AIInspectionResult`, `PriorityBreakdown`, `HotspotCluster`, 6 illustrative wards, 12 demo reports (`AW-2026-001`–`012`) |
| **Client Utilities** | `src/utils/storage.ts` | Browser-local demo persistence (`apnaward_issues_v1`), `normalizeIssue`, globally collision-resistant tracking code suffix |
| **Cloud Utilities** | `src/utils/cloud.ts`, `src/components/CloudAccountModal.tsx` | Optional Supabase Auth, refreshable access session, RLS-protected resident report create/read and status update request |
| | `src/utils/priority.ts` | Deterministic 0–100 attention scoring & explanation |
| | `src/utils/hotspots.ts` | Haversine distance & spatial cluster builder |
| | `src/utils/duplicates.ts` | Unicode-aware similarity + proximity duplicate detection |
| | `src/utils/api.ts` | `/api/analyze-issue` fetch wrapper & relative time formatter |
| | `src/utils/imageHelper.ts` | Image MIME/size validation & Canvas JPEG compression |
| | `src/utils/speechRecognition.ts` | Browser Web Speech API wrapper (`en-IN` / `hi-IN`) |
| **Pages & UI** | `src/components/*.tsx` | `HomePage`, `CommandCenterPage`, `OverviewPage`, `ReportIssuePage`, `ComplaintTrackingPage`, `AiInspectorPage`, `LiveMapPage`, `LocationPickerMap`, `IssueManagementPage`, `IssueDetailDrawer`, `SmartPriorityPage`, `JudgePresentationModal`, `GuidedProductTour`, `CitizenOnboardingModal`, `StatusIndicators`, `MotionPrimitives` |
| **Localization** | `src/i18n/LanguageContext.tsx`, `translations.ts`, `homeTranslations.ts` | Complete `en` & `hi` translation dictionaries & context provider |

---

## 3. Data Models (`src/types/civic.ts`)

- **`CivicIssue`**: `id`, `title`, `category`, `severity`, `status`, `wardId`, `wardName`, `landmark`, `description`, `latitude`, `longitude`, optional `photoDataUrl`, `isDemoData`, `createdAt`, `updatedAt`, optional `aiAnalysis`, `aiSuggestionEdited`, `aiUnavailableFallback`, and `timeline: StatusTimelineEntry[]`.
- **`StatusTimelineEntry`**: `id`, `status`, `timestamp`, `actor`, `note`.
- **`AIInspectionResult`**: `category`, `severity`, `explanation`, `publicImpact`, `recommendedAction`, `imageAssessment`, `model`, `analyzedAt`, `disclaimer`.

---

## 4. Navigation Views & Server Routes

- **Client Views (`NavSection`):** `home` (with anchors `#home-intro`, `#why-apnaward`, `#how-it-works`, `#ward-glance`, `#platform-features`, `#trust-transparency`), `report` (Report an Issue), `track` (Track Your Report), `map` (Explore Map), `inspector` (Neighbourhood Insights), `overview` (Ward Operations), `command` (Ward Analytics), `management` (Community Reports), `priority` (What Needs Attention First).
- **HTTP Endpoints (`server.ts`):**
  - `GET /api/health` → `{ status: 'ok', aiConfigured: boolean }`
  - `POST /api/analyze-issue` → Analyzes report text + optional image via Gemini and returns structured suggestion JSON or typed fallback error (`400`, `413`, `403`, `429`, `502`, `503`).

---

## 5. Known Limitations & Future Development Guide

1. **Cloud persistence:** Supabase resident report create/read is integrated; browser-local demo data remains available. Add a deliberate offline sync queue and conflict resolution before relying on intermittent connectivity.
2. **Authentication & Roles:** Resident email/password auth is integrated. Trusted operator roles must be assigned out-of-band and verified with real ward/city location mapping before enabling operational use.
3. **Ward Boundaries:** Replace the 6 illustrative Bengaluru-area centroids in `ILLUSTRATIVE_WARDS` (`src/types/civic.ts`) with verified municipal ward GeoJSON polygons.
4. **Multilingual Data Content:** UI labels switch immediately between `EN` and `हिंदी`; user-submitted free-text titles/notes and historical demo text remain in the language entered unless translated server-side.
5. **Audit Trail & Notifications:** Database triggers record status transitions. Add notification delivery only after consent, provider configuration and delivery-failure handling are designed.
