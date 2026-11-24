import { createSeedDemoIssues } from '../data/demoIssues';
import { CivicIssue, IssueCategory, IssueStatus } from '../types/civic';

const STORAGE_KEY = 'apnaward_issues_v1';
const LEGACY_STORAGE_KEY = 'wardwatch_ai_issues_v1';

const LEGACY_CATEGORY_MAP: Record<string, IssueCategory> = {
  pothole: 'road_damage',
  broken_streetlight: 'streetlight',
  other: 'other',
  road_damage: 'road_damage',
  garbage: 'garbage',
  water_leakage: 'water_leakage',
  streetlight: 'streetlight',
  drainage: 'drainage',
  waterlogging: 'waterlogging',
  public_safety: 'public_safety',
};

const VALID_STATUSES = new Set<IssueStatus>([
  'Submitted',
  'Reported',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected',
  'Reopened',
]);
const VALID_SEVERITIES = new Set<CivicIssue['severity']>(['Low', 'Medium', 'High', 'Critical']);

function normalizeIssue(raw: Record<string, unknown>): CivicIssue {
  const legacyCat = String(raw.category ?? 'public_safety');
  const category: IssueCategory = LEGACY_CATEGORY_MAP[legacyCat] ?? 'public_safety';
  const landmark =
    typeof raw.landmark === 'string' && raw.landmark.trim() ? raw.landmark.trim() : 'Ward Location';
  const title =
    typeof raw.title === 'string' && raw.title.trim()
      ? raw.title.trim()
      : `${category.replace('_', ' ')} near ${landmark}`;

  const rawStatus = String(raw.status ?? 'Reported') as IssueStatus;
  const status: IssueStatus = VALID_STATUSES.has(rawStatus) ? rawStatus : 'Reported';

  const rawSeverity = String(raw.severity ?? 'Medium') as CivicIssue['severity'];
  const severity: CivicIssue['severity'] = VALID_SEVERITIES.has(rawSeverity) ? rawSeverity : 'Medium';

  const rawLat = Number(raw.latitude);
  const rawLng = Number(raw.longitude);
  const latitude = Number.isFinite(rawLat) && rawLat >= -90 && rawLat <= 90 ? rawLat : 12.9716;
  const longitude = Number.isFinite(rawLng) && rawLng >= -180 && rawLng <= 180 ? rawLng : 77.5946;

  const nowIso = new Date().toISOString();
  const createdAt =
    typeof raw.createdAt === 'string' && Number.isFinite(Date.parse(raw.createdAt))
      ? raw.createdAt
      : nowIso;
  const updatedAt =
    typeof raw.updatedAt === 'string' && Number.isFinite(Date.parse(raw.updatedAt))
      ? raw.updatedAt
      : createdAt;

  const rawTimeline = Array.isArray(raw.timeline) ? raw.timeline : [];
  const timeline =
    rawTimeline.length > 0
      ? rawTimeline.map((entry, idx) => {
          const item = (entry ?? {}) as Record<string, unknown>;
          const entryStatus = String(item.status ?? status) as IssueStatus;
          return {
            id: typeof item.id === 'string' && item.id ? item.id : `tl-norm-${idx}`,
            status: VALID_STATUSES.has(entryStatus) ? entryStatus : status,
            timestamp:
              typeof item.timestamp === 'string' && Number.isFinite(Date.parse(item.timestamp))
                ? item.timestamp
                : createdAt,
            actor: typeof item.actor === 'string' && item.actor.trim() ? item.actor : 'System',
            note: typeof item.note === 'string' ? item.note : '',
          };
        })
      : [
          {
            id: `tl-init-${Date.now()}`,
            status,
            timestamp: createdAt,
            actor: 'System',
            note: 'Complaint record restored.',
          },
        ];

  const aiRaw = raw.aiAnalysis as Record<string, unknown> | undefined;
  const aiSeverityRaw = String(aiRaw?.severity ?? severity) as CivicIssue['severity'];
  const aiAnalysis = aiRaw
    ? {
        category: LEGACY_CATEGORY_MAP[String(aiRaw.category ?? category)] ?? category,
        severity: VALID_SEVERITIES.has(aiSeverityRaw) ? aiSeverityRaw : 'Medium',
        explanation: String(aiRaw.explanation ?? ''),
        publicImpact:
          typeof aiRaw.publicImpact === 'string' && aiRaw.publicImpact.trim()
            ? aiRaw.publicImpact.trim()
            : 'Potential localized impact to nearby residents and commuters.',
        recommendedAction: String(aiRaw.recommendedAction ?? ''),
        imageAssessment: String(aiRaw.imageAssessment ?? ''),
        model: String(aiRaw.model ?? 'gemini-4-hydrogen'),
        analyzedAt: String(aiRaw.analyzedAt ?? createdAt),
        disclaimer: String(
          aiRaw.disclaimer ??
            'AI-generated suggestion only — not verified facts or an official inspection.'
        ),
      }
    : undefined;

  return {
    ...(raw as unknown as CivicIssue),
    title,
    category,
    severity,
    status,
    latitude,
    longitude,
    createdAt,
    updatedAt,
    timeline,
    aiAnalysis,
  };
}

export function loadIssues(): CivicIssue[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createSeedDemoIssues();
      try {
        const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacyRaw) {
          const legacyParsed = JSON.parse(legacyRaw) as unknown;
          if (Array.isArray(legacyParsed)) {
            const citizenReports = legacyParsed
              .map((item) => normalizeIssue(item as Record<string, unknown>))
              .filter((item) => !item.isDemoData);
            if (citizenReports.length > 0) {
              const merged = [...citizenReports, ...seed];
              saveIssues(merged);
              return merged;
            }
          }
        }
      } catch {
        // ignore legacy migration error
      }
      saveIssues(seed);
      return seed;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seed = createSeedDemoIssues();
      saveIssues(seed);
      return seed;
    }
    return parsed.map((item) => normalizeIssue(item as Record<string, unknown>));
  } catch {
    return createSeedDemoIssues();
  }
}

export function saveIssues(issues: CivicIssue[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
    return true;
  } catch {
    try {
      const trimmed = issues.map((issue, idx) =>
        idx > 2 && issue.photoDataUrl ? { ...issue, photoDataUrl: undefined } : issue
      );
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      return true;
    } catch {
      return false;
    }
  }
}

export function resetDemoIssues(): CivicIssue[] {
  const seed = createSeedDemoIssues();
  saveIssues(seed);
  return seed;
}

export function generateUniqueIssueId(existingIssues: CivicIssue[]): string {
  const year = new Date().getFullYear();
  let maxNum = 0;
  for (const item of existingIssues) {
    const match = item.id.match(/(?:AW|WW)-\d{4}-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (Number.isFinite(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  const next = String(maxNum + 1).padStart(3, '0');
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AW-${year}-${next}-${suffix}`;
}

export function appendStatusUpdate(
  issue: CivicIssue,
  newStatus: IssueStatus,
  note: string,
  actor = 'Ward Operations Admin'
): CivicIssue {
  const now = new Date().toISOString();
  const cleanNote =
    note.trim() || `Status updated from ${issue.status} to ${newStatus}.`;
  return {
    ...issue,
    status: newStatus,
    updatedAt: now,
    timeline: [
      ...issue.timeline,
      {
        id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        previousStatus: issue.status,
        status: newStatus,
        timestamp: now,
        actor,
        note: cleanNote,
      },
    ],
  };
}
