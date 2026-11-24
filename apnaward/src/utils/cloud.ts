import type { IndiaLocationRecord } from '../data/indiaLocations';
import type { CivicIssue, IssueStatus, UserProfile } from '../types/civic';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const SESSION_KEY = 'apnaward_supabase_session_v1';
const EVIDENCE_BUCKET = 'civic-evidence';
const MAX_EVIDENCE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EVIDENCE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);

type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: { id: string; email?: string };
};

type CloudIssue = {
  id: string;
  tracking_code: string;
  reporter_id: string;
  location_id: string | null;
  title: string;
  description: string;
  category: CivicIssue['category'];
  severity: CivicIssue['severity'];
  status: IssueStatus;
  state_code: string | null;
  district_name: string | null;
  city_name: string | null;
  ward_name: string | null;
  locality_name: string | null;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  photo_path: string | null;
  ai_analysis: CivicIssue['aiAnalysis'] | null;
  ai_suggestion_edited?: boolean;
  created_at: string;
  updated_at: string;
  issue_status_updates?: Array<{
    id: string;
    previous_status?: IssueStatus | null;
    status: IssueStatus;
    note: string;
    created_at: string;
    actor_id: string | null;
  }>;
};

export const cloudConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

class CloudRequestError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'CloudRequestError';
    this.status = status;
  }
}

function readSession(): SupabaseSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as SupabaseSession;
    if (!session.access_token || !session.user?.id) return null;
    return session;
  } catch {
    return null;
  }
}

function saveSession(session: SupabaseSession | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

async function authRequest(path: string, body?: unknown, token?: string) {
  if (!cloudConfigured) throw new Error('Cloud database is not configured. Add the Supabase URL and anon key.');
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY!,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.msg || data.message || data.error_description || data.error || 'Authentication failed.');
  return data;
}

export async function signInCloud(email: string, password: string) {
  const session = await authRequest('token?grant_type=password', { email, password }) as SupabaseSession & { expires_in?: number };
  saveSession({ ...session, expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + (session.expires_in ?? 3600) });
  return session.user;
}

export async function signUpCloud(email: string, password: string, displayName: string) {
  const data = await authRequest('signup', { email, password, data: { display_name: displayName } }) as SupabaseSession & { expires_in?: number };
  if (data.access_token) {
    saveSession({ ...data, expires_at: data.expires_at ?? Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600) });
  }
  return data.access_token ? data.user : null;
}

export async function recoverCloudPassword(email: string) {
  await authRequest('recover', { email });
}

export async function signOutCloud() {
  const session = readSession();
  if (session && cloudConfigured) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY!, Authorization: `Bearer ${session.access_token}` },
    }).catch(() => undefined);
  }
  saveSession(null);
}

export function getCloudUser() {
  return readSession()?.user ?? null;
}

async function getValidSession(): Promise<SupabaseSession | null> {
  const session = readSession();
  if (!session) return null;
  if (!session.expires_at || session.expires_at > Math.floor(Date.now() / 1000) + 60) return session;
  try {
    const refreshed = await authRequest('token?grant_type=refresh_token', { refresh_token: session.refresh_token }) as SupabaseSession & { expires_in?: number };
    const next = { ...refreshed, expires_at: refreshed.expires_at ?? Math.floor(Date.now() / 1000) + (refreshed.expires_in ?? 3600) };
    saveSession(next);
    return next;
  } catch {
    saveSession(null);
    return null;
  }
}

async function restRequest(path: string, method = 'GET', body?: unknown, prefer = 'return=representation') {
  const session = await getValidSession();
  if (!cloudConfigured || !session) throw new Error('Your session has expired or you are not signed in. Please sign in again.');
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      Prefer: prefer,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new CloudRequestError(data?.message || data?.hint || data?.details || 'Cloud request failed. Check database setup and access policies.', response.status);
  return data;
}

export async function fetchCloudProfile(): Promise<UserProfile | null> {
  const session = await getValidSession();
  if (!session) return null;
  const rows = await restRequest(
    `profiles?id=eq.${encodeURIComponent(session.user.id)}&select=id,display_name,role,state_code,district_name,city_name,ward_id`
  ) as UserProfile[];
  return rows?.[0] ?? null;
}

export async function updateCloudProfile(updates: {
  display_name: string;
}): Promise<UserProfile | null> {
  const session = await getValidSession();
  if (!session) throw new Error('Sign in to update your profile.');
  const rows = await restRequest(
    `profiles?id=eq.${encodeURIComponent(session.user.id)}`,
    'PATCH',
    { display_name: updates.display_name.trim() },
    'return=representation'
  ) as UserProfile[];
  return rows?.[0] ?? null;
}

export async function fetchCloudLocations(): Promise<IndiaLocationRecord[]> {
  if (!cloudConfigured) return [];
  const response = await fetch(`${SUPABASE_URL}/rest/v1/locations?is_active=eq.true&order=level.asc,name.asc`, {
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) return [];
  const rows = (await response.json().catch(() => [])) as Array<{
    id: string;
    parent_id: string | null;
    level: IndiaLocationRecord['level'];
    code: string | null;
    name: string;
    state_code: string | null;
    latitude: number | null;
    longitude: number | null;
    is_demo: boolean;
  }>;
  return (rows ?? []).map((r) => ({
    id: r.id,
    parentId: r.parent_id,
    level: r.level,
    code: r.code,
    name: r.name,
    stateCode: r.state_code ?? '',
    latitude: r.latitude,
    longitude: r.longitude,
    isDemo: r.is_demo,
  }));
}

function detectImageMimeFromBytes(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'image/jpeg';
  }
  if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'image/png';
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return 'image/webp';
  }
  return null;
}

function dataUrlToBlob(dataUrl: string): { blob: Blob; mimeType: string } {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header?.match(/data:([^;]+);base64/);
  const declaredMime = mimeMatch?.[1] || '';
  if (!ALLOWED_EVIDENCE_MIMES.has(declaredMime)) {
    throw new Error('Only JPEG, PNG, and WebP images are permitted for evidence upload.');
  }
  const binary = atob(base64 || '');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_EVIDENCE_BYTES) {
    throw new Error('Evidence photo must be between 1 byte and 5 MB.');
  }
  const detectedMime = detectImageMimeFromBytes(bytes);
  if (!detectedMime || detectedMime !== declaredMime) {
    throw new Error('Uploaded file content does not match a valid JPEG, PNG, or WebP image.');
  }
  return { blob: new Blob([bytes], { type: detectedMime }), mimeType: detectedMime };
}

export async function uploadEvidencePhoto(
  dataUrl: string,
  trackingCode: string
): Promise<{ path: string; mimeType: string; sizeBytes: number }> {
  const session = await getValidSession();
  if (!cloudConfigured || !session) {
    throw new Error('Sign in to upload evidence photos to private cloud storage.');
  }
  const { blob, mimeType } = dataUrlToBlob(dataUrl);
  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const uniqueSuffix = Math.random().toString(36).slice(2, 10);
  const objectPath = `${session.user.id}/${trackingCode}-${uniqueSuffix}.${ext}`;

  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${EVIDENCE_BUCKET}/${objectPath}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': mimeType,
      'x-upsert': 'false',
    },
    body: blob,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || err.error || 'Failed to upload evidence photo to private storage.');
  }

  return { path: objectPath, mimeType, sizeBytes: blob.size };
}

async function deleteOwnEvidencePhoto(photoPath: string): Promise<void> {
  const session = await getValidSession();
  if (!cloudConfigured || !session || !photoPath.startsWith(`${session.user.id}/`)) return;
  await fetch(`${SUPABASE_URL}/storage/v1/object/${EVIDENCE_BUCKET}/${photoPath}`, {
    method: 'DELETE',
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${session.access_token}`,
    },
  }).catch(() => undefined);
}

export async function getEvidenceSignedUrl(photoPath: string): Promise<string | null> {
  const session = await getValidSession();
  if (!cloudConfigured || !session || !photoPath) return null;
  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/${EVIDENCE_BUCKET}/${photoPath}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ expiresIn: 3600 }),
  });
  if (!response.ok) return null;
  const data = (await response.json().catch(() => null)) as { signedURL?: string } | null;
  if (!data?.signedURL) return null;
  return data.signedURL.startsWith('http') ? data.signedURL : `${SUPABASE_URL}/storage/v1${data.signedURL}`;
}

function fromCloud(row: CloudIssue): CivicIssue {
  const timeline = (row.issue_status_updates ?? []).map((item) => ({
    id: item.id,
    previousStatus: item.previous_status ?? undefined,
    status: item.status,
    timestamp: item.created_at,
    actor: item.actor_id ? 'ApnaWard team' : 'System',
    note: item.note,
  }));
  if (!timeline.length) timeline.push({
    id: `cloud-${row.id}`,
    status: row.status,
    timestamp: row.created_at,
    actor: 'Resident',
    note: 'Report submitted.',
  });
  return {
    id: row.tracking_code,
    title: row.title,
    description: row.description,
    category: row.category,
    severity: row.severity,
    status: row.status,
    locationId: row.location_id ?? undefined,
    stateCode: row.state_code ?? undefined,
    districtName: row.district_name ?? undefined,
    cityName: row.city_name ?? undefined,
    wardId: row.location_id || row.ward_name || 'unassigned',
    wardName: row.ward_name || 'Location pending verification',
    localityName: row.locality_name ?? undefined,
    landmark: row.landmark || row.locality_name || 'Not provided',
    latitude: row.latitude ?? 20.5937,
    longitude: row.longitude ?? 78.9629,
    photoPath: row.photo_path ?? undefined,
    isDemoData: false,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    aiAnalysis: row.ai_analysis ?? undefined,
    aiSuggestionEdited: row.ai_suggestion_edited,
    timeline,
  };
}

export async function fetchCloudIssues(limit = 50, offset = 0): Promise<CivicIssue[]> {
  const safeLimit = Math.min(100, Math.max(1, Math.trunc(limit)));
  const safeOffset = Math.max(0, Math.trunc(offset));
  const rows = await restRequest(
    `civic_issues?select=*,issue_status_updates(*)&is_demo=eq.false&order=created_at.desc&limit=${safeLimit}&offset=${safeOffset}`
  ) as CloudIssue[];
  return (rows ?? []).map(fromCloud);
}

export async function createCloudIssue(issue: CivicIssue): Promise<CivicIssue> {
  const session = await getValidSession();
  if (!session) throw new Error('Sign in to submit a persistent cloud report.');

  let photoPath: string | null = null;
  let uploadedMeta: { path: string; mimeType: string; sizeBytes: number } | null = null;
  if (issue.photoDataUrl) {
    uploadedMeta = await uploadEvidencePhoto(issue.photoDataUrl, issue.id);
    photoPath = uploadedMeta.path;
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(issue.locationId || '');
  let inserted: CloudIssue[];
  try {
    inserted = await restRequest('civic_issues', 'POST', {
      tracking_code: issue.id,
      reporter_id: session.user.id,
      location_id: isUuid ? issue.locationId : null,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      severity: issue.severity,
      status: 'Submitted',
      state_code: issue.stateCode ?? null,
      district_name: issue.districtName ?? null,
      city_name: issue.cityName ?? null,
      ward_name: issue.wardName,
      locality_name: issue.localityName || issue.landmark,
      landmark: issue.landmark,
      latitude: issue.latitude,
      longitude: issue.longitude,
      photo_path: photoPath,
      ai_analysis: issue.aiAnalysis ?? null,
      ai_suggestion_edited: Boolean(issue.aiSuggestionEdited),
      is_demo: false,
    }) as CloudIssue[];
  } catch (error) {
    // Only compensate after a definite HTTP rejection. A network timeout may hide a committed insert.
    if (uploadedMeta && error instanceof CloudRequestError) await deleteOwnEvidencePhoto(uploadedMeta.path);
    if (uploadedMeta && !(error instanceof CloudRequestError)) {
      throw new Error(`Cloud complaint creation could not be confirmed for ${issue.id}. Check tracking before retrying; evidence cleanup was skipped to avoid breaking a possibly committed report.`);
    }
    throw error;
  }

  const createdRow = inserted?.[0];
  if (!createdRow) {
    throw new Error(`Cloud did not return a saved complaint record for ${issue.id}. Check tracking before retrying.`);
  }
  let evidenceWarning: string | undefined;
  if (createdRow?.id && uploadedMeta) {
    try {
      await restRequest('issue_attachments', 'POST', {
        issue_id: createdRow.id,
        uploader_id: session.user.id,
        storage_bucket: EVIDENCE_BUCKET,
        storage_path: uploadedMeta.path,
        mime_type: uploadedMeta.mimeType,
        file_size_bytes: uploadedMeta.sizeBytes,
      });
    } catch (attachmentError) {
      if (!(attachmentError instanceof CloudRequestError)) {
        throw new Error(`Complaint ${issue.id} was created, but the attachment result is uncertain. Check the complaint and attachment records before retrying.`);
      }
      // A definite metadata rejection: preserve the complaint, remove the unreferenced object, and clear its path.
      await deleteOwnEvidencePhoto(uploadedMeta.path);
      try {
        await restRequest(`civic_issues?id=eq.${encodeURIComponent(createdRow.id)}`, 'PATCH', { photo_path: null });
        createdRow.photo_path = null;
        evidenceWarning = 'The complaint was saved, but its photo could not be attached. Please retry the photo upload.';
      } catch {
        throw new Error(`Complaint ${issue.id} was created, but evidence metadata failed and cleanup could not be confirmed. Check the cloud record before retrying.`);
      }
    }
  }

  const result = fromCloud(createdRow);
  return evidenceWarning ? { ...result, evidenceWarning } : result;
}

export async function updateCloudIssueStatus(issueId: string, status: IssueStatus) {
  const rows = await restRequest(`civic_issues?tracking_code=eq.${encodeURIComponent(issueId)}`, 'PATCH', {
    status,
    updated_at: new Date().toISOString(),
  }, 'return=representation') as unknown[];
  if (!rows?.length) {
    throw new Error('The cloud database did not authorize this status change. Only an operator assigned to the report’s ward or city can update it.');
  }
}

export async function publicTrackCloudIssue(trackingCode: string): Promise<CivicIssue | null> {
  const res = await fetch(`/api/public/track/${encodeURIComponent(trackingCode)}`);
  if (!res.ok) return null;
  const data = (await res.json().catch(() => null)) as {
    report?: {
      trackingCode: string;
      category: CivicIssue['category'];
      severity: CivicIssue['severity'];
      status: IssueStatus;
      stateCode?: string | null;
      districtName?: string | null;
      cityName?: string | null;
      wardName?: string | null;
      createdAt: string;
      updatedAt: string;
      timeline?: Array<{ id: string; previousStatus?: IssueStatus; status: IssueStatus; timestamp: string }>;
    };
  } | null;
  if (!data?.report) return null;
  const r = data.report;
  return {
    id: r.trackingCode,
    title: `Civic report ${r.trackingCode}`, 
    description: 'Public tracking view (detailed description and reporter details are protected).',
    category: r.category,
    severity: r.severity,
    status: r.status,
    stateCode: r.stateCode ?? undefined,
    districtName: r.districtName ?? undefined,
    cityName: r.cityName ?? undefined,
    wardId: r.wardName || 'unassigned',
    wardName: r.wardName || 'Verified Ward',
    landmark: r.cityName || 'Protected',
    latitude: 20.5937,
    longitude: 78.9629,
    isDemoData: false,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    timeline: (r.timeline ?? []).map((t) => ({
      id: t.id,
      previousStatus: t.previousStatus,
      status: t.status,
      timestamp: t.timestamp,
      actor: 'ApnaWard',
      note: 'Status updated.',
    })),
  };
}
