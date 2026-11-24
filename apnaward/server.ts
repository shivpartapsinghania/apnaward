import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/\/$/, '');
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
const SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const VALID_CATEGORIES = new Set([
  'road_damage',
  'garbage',
  'water_leakage',
  'streetlight',
  'drainage',
  'waterlogging',
  'public_safety',
  'other',
]);

const VALID_SEVERITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
const VALID_STATUSES = new Set([
  'Submitted',
  'Reported',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected',
  'Reopened',
]);

interface AnalyzeIssueBody {
  title?: string;
  description?: string;
  area?: string;
  selectedCategory?: string;
  imageBase64?: string;
  imageMimeType?: string;
}

interface AuthenticatedUser {
  id: string;
  email?: string;
  token: string;
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getAllowedOrigins(): Set<string> {
  const origins = new Set<string>([
    `http://localhost:${PORT}`,
    `http://127.0.0.1:${PORT}`,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]);
  const appUrl = process.env.APP_URL?.trim();
  if (appUrl) {
    try {
      origins.add(new URL(appUrl).origin);
    } catch {
      // ignore invalid APP_URL
    }
  }
  return origins;
}

function createRateLimiter(windowMs: number, maxRequests: number, code: string, errorMessage: string) {
  const windows = new Map<string, { count: number; resetAt: number }>();
  const prune = () => {
    const now = Date.now();
    for (const [key, value] of windows) {
      if (value.resetAt <= now) windows.delete(key);
    }
  };
  const timer = setInterval(prune, Math.min(windowMs, 5 * 60 * 1000));
  timer.unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const current = windows.get(key);
    if (!current || current.resetAt <= now) {
      windows.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    if (current.count >= maxRequests) {
      res.setHeader('Retry-After', String(Math.ceil((current.resetAt - now) / 1000)));
      res.status(429).json({ error: errorMessage, code });
      return;
    }
    current.count += 1;
    next();
  };
}

async function verifySupabaseBearer(req: Request): Promise<AuthenticatedUser | null> {
  if (!SUPABASE_CONFIGURED) return null;
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) return null;
  const user = (await response.json().catch(() => null)) as { id?: string; email?: string } | null;
  if (!user?.id) return null;
  return { id: user.id, email: user.email, token };
}

async function supabaseRest(
  pathWithQuery: string,
  options: { method?: string; token?: string; body?: unknown; prefer?: string } = {}
) {
  if (!SUPABASE_CONFIGURED) {
    throw new Error('Supabase is not configured on the server.');
  }
  const headers: Record<string, string> = {
    apikey: SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  if (options.prefer) {
    headers.Prefer = options.prefer;
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${pathWithQuery}`, {
    method: options.method ?? 'GET',
    headers,
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });

  const data = response.status === 204 ? null : await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };
}

async function startServer(): Promise<void> {
  const app = express();
  const allowedOrigins = getAllowedOrigins();

  app.disable('x-powered-by');
  app.use((_req: Request, res: Response, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), geolocation=(self), microphone=(self)');
    next();
  });

  // Safe request logging without tokens or PII
  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const durationMs = Date.now() - start;
      console.log(`[api] ${req.method} ${req.path} -> ${res.statusCode} (${durationMs}ms)`);
    });
    next();
  });

  // Strict CORS for API routes
  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Vary', 'Origin');
      if (allowedOrigins.has(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
      } else {
        res.status(403).json({ error: 'Origin not allowed by CORS policy.', code: 'CORS_FORBIDDEN' });
        return;
      }
    }
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.use(express.json({ limit: '9mb' }));

  // General API rate limit + endpoint-specific limits
  app.use(
    '/api',
    createRateLimiter(
      5 * 60 * 1000,
      180,
      'API_RATE_LIMITED',
      'Too many API requests from this connection. Please slow down and try again.'
    )
  );

  app.use(
    '/api/analyze-issue',
    createRateLimiter(
      10 * 60 * 1000,
      12,
      'RATE_LIMITED',
      'Too many AI analysis requests from this connection. Please wait a few minutes or submit the report manually.'
    )
  );

  app.use(
    '/api/public/track',
    createRateLimiter(
      5 * 60 * 1000,
      30,
      'TRACK_RATE_LIMITED',
      'Too many tracking lookups. Please wait a few minutes before trying again.'
    )
  );

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      aiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
      supabaseConfigured: SUPABASE_CONFIGURED,
      timestamp: new Date().toISOString(),
    });
  });

  // Public Pan-India location catalogue (returns active locations from Supabase when configured)
  app.get('/api/locations', async (req: Request, res: Response) => {
    if (!SUPABASE_CONFIGURED) {
      res.json({ source: 'demo', locations: [] });
      return;
    }
    try {
      const stateCode = typeof req.query.stateCode === 'string' ? req.query.stateCode.trim().toUpperCase() : '';
      const query = stateCode
        ? `locations?is_active=eq.true&state_code=eq.${encodeURIComponent(stateCode)}&order=level.asc,name.asc`
        : 'locations?is_active=eq.true&order=level.asc,name.asc';
      const { ok, status, data } = await supabaseRest(query);
      if (!ok) {
        res.status(status).json({ error: 'Unable to load location catalogue.', code: 'LOCATIONS_FAILED' });
        return;
      }
      res.json({ source: 'supabase', locations: data ?? [] });
    } catch {
      res.status(502).json({ error: 'Location catalogue service unavailable.', code: 'LOCATIONS_ERROR' });
    }
  });

  // Privacy-safe public tracking endpoint (rate-limited, no PII)
  app.get('/api/public/track/:trackingCode', async (req: Request, res: Response) => {
    const rawCode = String(req.params.trackingCode || '').trim();
    if (!/^[A-Za-z0-9-]{6,40}$/.test(rawCode)) {
      res.status(400).json({ error: 'Invalid tracking code format.', code: 'INVALID_TRACKING_CODE' });
      return;
    }
    if (!SUPABASE_CONFIGURED) {
      res.status(503).json({
        error: 'Cloud tracking is not configured in this environment.',
        code: 'CLOUD_UNAVAILABLE',
      });
      return;
    }
    try {
      const { ok, status, data } = await supabaseRest('rpc/public_track_issue', {
        method: 'POST',
        body: { p_tracking_code: rawCode },
      });
      if (!ok) {
        res.status(status).json({ error: 'Tracking lookup failed.', code: 'TRACK_FAILED' });
        return;
      }
      if (!data) {
        res.status(404).json({ error: 'No cloud report found with that tracking code.', code: 'NOT_FOUND' });
        return;
      }
      res.json({ report: data });
    } catch {
      res.status(502).json({ error: 'Tracking service unavailable.', code: 'TRACK_ERROR' });
    }
  });

  // Verified profile endpoint (never trusts client-supplied role or user ID)
  app.get('/api/me', async (req: Request, res: Response) => {
    if (!SUPABASE_CONFIGURED) {
      res.status(503).json({ error: 'Cloud authentication is not configured.', code: 'CLOUD_UNAVAILABLE' });
      return;
    }
    const user = await verifySupabaseBearer(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required.', code: 'UNAUTHORIZED' });
      return;
    }
    const { ok, status, data } = await supabaseRest(
      `profiles?id=eq.${encodeURIComponent(user.id)}&select=id,display_name,role,state_code,district_name,city_name,ward_id,created_at,updated_at`,
      { token: user.token }
    );
    if (!ok) {
      res.status(status).json({ error: 'Could not load profile.', code: 'PROFILE_ERROR' });
      return;
    }
    const profile = Array.isArray(data) ? data[0] ?? null : null;
    res.json({ user: { id: user.id, email: user.email }, profile });
  });

  app.patch('/api/me', async (req: Request, res: Response) => {
    if (!req.is('application/json')) {
      res.status(415).json({ error: 'Send this request as application/json.', code: 'UNSUPPORTED_MEDIA_TYPE' });
      return;
    }
    if (!SUPABASE_CONFIGURED) {
      res.status(503).json({ error: 'Cloud authentication is not configured.', code: 'CLOUD_UNAVAILABLE' });
      return;
    }
    const user = await verifySupabaseBearer(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required.', code: 'UNAUTHORIZED' });
      return;
    }
    const body = (req.body ?? {}) as Record<string, unknown>;
    const forbiddenFields = ['role', 'state_code', 'district_name', 'city_name', 'ward_id'];
    if (forbiddenFields.some((k) => k in body)) {
      res.status(403).json({
        error: 'Role and geographic scope assignments cannot be modified via self-service.',
        code: 'PRIVILEGED_FIELD_FORBIDDEN',
      });
      return;
    }
    const updatePayload: Record<string, unknown> = {};
    if (typeof body.display_name === 'string') {
      const name = body.display_name.trim().slice(0, 120);
      if (name.length < 2) {
        res.status(400).json({ error: 'Display name must be at least 2 characters.', code: 'INVALID_INPUT' });
        return;
      }
      updatePayload.display_name = name;
    } else {
      res.status(400).json({ error: 'Provide display_name to update.', code: 'INVALID_INPUT' });
      return;
    }

    const { ok, status, data } = await supabaseRest(`profiles?id=eq.${encodeURIComponent(user.id)}`, {
      method: 'PATCH',
      token: user.token,
      body: updatePayload,
      prefer: 'return=representation',
    });
    if (!ok) {
      res.status(status).json({ error: 'Could not update profile.', code: 'PROFILE_UPDATE_FAILED' });
      return;
    }
    res.json({ profile: Array.isArray(data) ? data[0] ?? null : null });
  });

  // Authenticated issues API (enforces server-side validation + Supabase RLS)
  app.get('/api/issues', async (req: Request, res: Response) => {
    if (!SUPABASE_CONFIGURED) {
      res.status(503).json({ error: 'Cloud database is not configured.', code: 'CLOUD_UNAVAILABLE' });
      return;
    }
    const user = await verifySupabaseBearer(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required.', code: 'UNAUTHORIZED' });
      return;
    }
    const rawLimit = Number(req.query.limit ?? 25);
    const rawOffset = Number(req.query.offset ?? 0);
    const limit = Number.isFinite(rawLimit) ? Math.min(100, Math.max(1, Math.trunc(rawLimit))) : 25;
    const offset = Number.isFinite(rawOffset) ? Math.max(0, Math.trunc(rawOffset)) : 0;
    const { ok, status, data } = await supabaseRest(
      `civic_issues?select=*,issue_status_updates(*)&is_demo=eq.false&order=created_at.desc&limit=${limit}&offset=${offset}`,
      { token: user.token }
    );
    if (!ok) {
      res.status(status).json({ error: 'Unable to fetch cloud reports.', code: 'ISSUES_FETCH_FAILED' });
      return;
    }
    res.json({ issues: data ?? [], pagination: { limit, offset } });
  });

  app.post('/api/issues', async (req: Request, res: Response) => {
    if (!req.is('application/json')) {
      res.status(415).json({ error: 'Send this request as application/json.', code: 'UNSUPPORTED_MEDIA_TYPE' });
      return;
    }
    if (!SUPABASE_CONFIGURED) {
      res.status(503).json({ error: 'Cloud database is not configured.', code: 'CLOUD_UNAVAILABLE' });
      return;
    }
    const user = await verifySupabaseBearer(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required to submit a cloud report.', code: 'UNAUTHORIZED' });
      return;
    }
    const body = (req.body ?? {}) as Record<string, unknown>;
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const category = typeof body.category === 'string' ? body.category.trim() : '';
    const severity = typeof body.severity === 'string' ? body.severity.trim() : 'Medium';
    const trackingCode = typeof body.tracking_code === 'string' ? body.tracking_code.trim() : '';

    if (title.length < 4 || title.length > 240) {
      res.status(400).json({ error: 'Title must be between 4 and 240 characters.', code: 'INVALID_INPUT' });
      return;
    }
    if (description.length < 5 || description.length > 5000) {
      res.status(400).json({ error: 'Description must be between 5 and 5000 characters.', code: 'INVALID_INPUT' });
      return;
    }
    if (!VALID_CATEGORIES.has(category)) {
      res.status(400).json({ error: 'Invalid civic issue category.', code: 'INVALID_INPUT' });
      return;
    }
    if (!VALID_SEVERITIES.includes(severity as (typeof VALID_SEVERITIES)[number])) {
      res.status(400).json({ error: 'Invalid severity value.', code: 'INVALID_INPUT' });
      return;
    }
    if (!/^[A-Za-z0-9-]{6,40}$/.test(trackingCode)) {
      res.status(400).json({ error: 'Invalid tracking code.', code: 'INVALID_INPUT' });
      return;
    }

    const payload = {
      tracking_code: trackingCode,
      reporter_id: user.id,
      location_id: typeof body.location_id === 'string' && body.location_id ? body.location_id : null,
      title,
      description,
      category,
      severity,
      status: 'Submitted',
      state_code: typeof body.state_code === 'string' ? body.state_code.trim().toUpperCase().slice(0, 8) : null,
      district_name: typeof body.district_name === 'string' ? body.district_name.trim().slice(0, 120) : null,
      city_name: typeof body.city_name === 'string' ? body.city_name.trim().slice(0, 120) : null,
      ward_name: typeof body.ward_name === 'string' ? body.ward_name.trim().slice(0, 160) : null,
      locality_name: typeof body.locality_name === 'string' ? body.locality_name.trim().slice(0, 160) : null,
      landmark: typeof body.landmark === 'string' ? body.landmark.trim().slice(0, 200) : null,
      latitude: typeof body.latitude === 'number' && Number.isFinite(body.latitude) ? body.latitude : null,
      longitude: typeof body.longitude === 'number' && Number.isFinite(body.longitude) ? body.longitude : null,
      photo_path: (() => {
        if (typeof body.photo_path !== 'string' || !body.photo_path.trim()) return null;
        const p = body.photo_path.trim().slice(0, 300);
        if (p.includes('..') || !p.startsWith(`${user.id}/`)) return null;
        return p;
      })(),
      ai_analysis: body.ai_analysis ?? null,
      ai_suggestion_edited: Boolean(body.ai_suggestion_edited),
      is_demo: false,
    };

    const { ok, status, data } = await supabaseRest('civic_issues', {
      method: 'POST',
      token: user.token,
      body: payload,
      prefer: 'return=representation',
    });
    if (!ok) {
      res.status(status).json({
        error: (data as { message?: string } | null)?.message || 'Failed to save report in cloud database.',
        code: 'ISSUE_CREATE_FAILED',
      });
      return;
    }
    res.status(201).json({ issue: Array.isArray(data) ? data[0] : data });
  });

  app.patch('/api/issues/:trackingCode/status', async (req: Request, res: Response) => {
    if (!req.is('application/json')) {
      res.status(415).json({ error: 'Send this request as application/json.', code: 'UNSUPPORTED_MEDIA_TYPE' });
      return;
    }
    if (!SUPABASE_CONFIGURED) {
      res.status(503).json({ error: 'Cloud database is not configured.', code: 'CLOUD_UNAVAILABLE' });
      return;
    }
    const user = await verifySupabaseBearer(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required.', code: 'UNAUTHORIZED' });
      return;
    }
    const trackingCode = String(req.params.trackingCode || '').trim();
    if (!/^[A-Za-z0-9-]{6,40}$/.test(trackingCode)) {
      res.status(400).json({ error: 'Invalid tracking code format.', code: 'INVALID_TRACKING_CODE' });
      return;
    }
    const body = (req.body ?? {}) as Record<string, unknown>;
    const newStatus = typeof body.status === 'string' ? body.status.trim() : '';
    if (!VALID_STATUSES.has(newStatus)) {
      res.status(400).json({ error: 'Invalid status value.', code: 'INVALID_STATUS' });
      return;
    }

    // Verify operator role server-side from database profile
    const profileRes = await supabaseRest(
      `profiles?id=eq.${encodeURIComponent(user.id)}&select=role`,
      { token: user.token }
    );
    const role = Array.isArray(profileRes.data) ? profileRes.data[0]?.role : null;
    if (!['ward_admin', 'city_admin', 'platform_admin'].includes(String(role))) {
      res.status(403).json({ error: 'Only authorized ward, city, or platform admins can update status.', code: 'FORBIDDEN' });
      return;
    }

    const { ok, status, data } = await supabaseRest(
      `civic_issues?tracking_code=eq.${encodeURIComponent(trackingCode)}`,
      {
        method: 'PATCH',
        token: user.token,
        body: { status: newStatus, updated_at: new Date().toISOString() },
        prefer: 'return=representation',
      }
    );
    if (!ok) {
      res.status(status).json({ error: 'Cloud status update failed.', code: 'STATUS_UPDATE_FAILED' });
      return;
    }
    if (!Array.isArray(data) || data.length === 0) {
      res.status(403).json({
        error: 'Status update not permitted for your assigned ward or city scope.',
        code: 'SCOPE_FORBIDDEN',
      });
      return;
    }
    res.json({ issue: data[0] });
  });

  app.post('/api/issues/:trackingCode/verify', async (req: Request, res: Response) => {
    if (!SUPABASE_CONFIGURED) {
      res.status(503).json({ error: 'Cloud database is not configured.', code: 'CLOUD_UNAVAILABLE' });
      return;
    }
    const user = await verifySupabaseBearer(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required to verify a report.', code: 'UNAUTHORIZED' });
      return;
    }
    const trackingCode = String(req.params.trackingCode || '').trim();
    if (!/^[A-Za-z0-9-]{6,40}$/.test(trackingCode)) {
      res.status(400).json({ error: 'Invalid tracking code format.', code: 'INVALID_TRACKING_CODE' });
      return;
    }
    const { ok, status, data } = await supabaseRest('rpc/verify_civic_issue', {
      method: 'POST',
      token: user.token,
      body: { p_tracking_code: trackingCode },
    });
    if (!ok) {
      res.status(status).json({ error: 'Could not verify report.', code: 'VERIFY_FAILED' });
      return;
    }
    res.json({ communityVerifications: Number(data ?? 0) });
  });

  app.post('/api/issues/:trackingCode/reopen', async (req: Request, res: Response) => {
    if (!req.is('application/json')) {
      res.status(415).json({ error: 'Send this request as application/json.', code: 'UNSUPPORTED_MEDIA_TYPE' });
      return;
    }
    if (!SUPABASE_CONFIGURED) {
      res.status(503).json({ error: 'Cloud database is not configured.', code: 'CLOUD_UNAVAILABLE' });
      return;
    }
    const user = await verifySupabaseBearer(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required to reopen a report.', code: 'UNAUTHORIZED' });
      return;
    }
    const trackingCode = String(req.params.trackingCode || '').trim();
    if (!/^[A-Za-z0-9-]{6,40}$/.test(trackingCode)) {
      res.status(400).json({ error: 'Invalid tracking code format.', code: 'INVALID_TRACKING_CODE' });
      return;
    }
    const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim().slice(0, 500) : '';
    const { ok, status, data } = await supabaseRest('rpc/reopen_own_issue', {
      method: 'POST',
      token: user.token,
      body: { p_tracking_code: trackingCode, p_reason: reason },
    });
    if (!ok) {
      res.status(status).json({ error: 'Could not reopen report.', code: 'REOPEN_FAILED' });
      return;
    }
    res.json({ issue: data });
  });

  app.post('/api/analyze-issue', async (req: Request, res: Response) => {
    if (!req.is('application/json')) {
      res.status(415).json({ error: 'Send this request as application/json.', code: 'UNSUPPORTED_MEDIA_TYPE' });
      return;
    }
    const body = (req.body ?? {}) as AnalyzeIssueBody;
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 240) : '';
    const description =
      typeof body.description === 'string' ? body.description.trim().slice(0, 4000) : '';
    const area = typeof body.area === 'string' ? body.area.trim().slice(0, 240) : '';
    const selectedCategory =
      typeof body.selectedCategory === 'string' ? body.selectedCategory.trim().slice(0, 64) : '';
    const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64.trim() : '';
    const allowedMimes = new Set(['image/jpeg', 'image/png', 'image/webp']);
    const imageMimeType =
      typeof body.imageMimeType === 'string' && allowedMimes.has(body.imageMimeType)
        ? body.imageMimeType
        : 'image/jpeg';

    if (imageBase64.length > 8_000_000) {
      res.status(413).json({
        error: 'Uploaded image payload is too large for AI analysis. You can still submit the complaint manually.',
        code: 'PAYLOAD_TOO_LARGE',
      });
      return;
    }

    if (!title && !description && !imageBase64) {
      res.status(400).json({
        error: 'Provide a report title, description, or photo so ApnaWard can help understand the issue.',
        code: 'INVALID_INPUT',
      });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'Gemini AI service is not configured in this environment. You can still classify and submit the complaint manually.',
        code: 'AI_UNAVAILABLE',
      });
      return;
    }

    try {
      const promptLines = [
        'Analyze this citizen civic infrastructure complaint for preliminary ward-level triage.',
        title ? `Complaint Title: "${title}"` : '',
        area ? `Reported Ward / Locality: ${area}` : '',
        selectedCategory ? `Citizen initial category selection: ${selectedCategory}` : '',
        description
          ? `Citizen description: "${description}"`
          : 'Citizen description: (No text provided; evaluate only what is clearly visible in the attached image.)',
        imageBase64
          ? 'An image is attached. Describe ONLY clearly visible infrastructure conditions. If the image is blurry, too dark, obstructed, or does not clearly show a civic issue, state that explicitly in imageAssessment without guessing or fabricating visual details.'
          : 'No image was provided. Set imageAssessment to explicitly note that no photo was uploaded and analysis is based solely on the submitted text.',
      ]
        .filter(Boolean)
        .join('\n');

      const parts: Array<
        | { text: string }
        | { inlineData: { mimeType: string; data: string } }
      > = [];

      if (imageBase64) {
        const cleanBase64 = imageBase64.includes(',')
          ? imageBase64.split(',')[1] ?? ''
          : imageBase64;
        if (cleanBase64) {
          parts.push({
            inlineData: {
              mimeType: imageMimeType,
              data: cleanBase64,
            },
          });
        }
      }

      parts.push({ text: promptLines });

      const callGenerate = () =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: { parts },
          config: {
            systemInstruction: [
              'You are ApnaWard Neighbourhood Insights assistant, an objective preliminary triage helper for community ward teams.',
              'Classify the complaint into one of these exact categories: road_damage, garbage, water_leakage, streetlight, drainage, waterlogging, public_safety, or other.',
              'Estimate severity as exactly one of: Low, Medium, High, or Critical based on potential safety hazard, traffic/pedestrian risk, utility disruption, or public health exposure.',
              'In explanation, concisely explain (2 sentences) why that category and severity were suggested based strictly on the provided text and any clearly visible image evidence.',
              'In publicImpact, identify the possible public impact (1-2 sentences, e.g., commuters, school pedestrians, local sanitation, nighttime visibility) without claiming verified real-world danger.',
              'In recommendedAction, suggest one practical next administrative or field-check action for the ward team (1-2 sentences).',
              'Never invent or fabricate visual findings that are not clearly visible. If an image is missing, blurry, dark, or ambiguous, state that clearly in imageAssessment.',
              'Frame all outputs strictly as AI-generated triage suggestions, never verified facts or official engineering inspections.',
            ].join(' '),
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: {
                  type: Type.STRING,
                  description:
                    'One of: road_damage, garbage, water_leakage, streetlight, drainage, waterlogging, public_safety, other',
                },
                severity: {
                  type: Type.STRING,
                  description: 'One of: Low, Medium, High, Critical',
                },
                explanation: {
                  type: Type.STRING,
                  description:
                    'Concise explanation for why the suggested category and severity were chosen.',
                },
                publicImpact: {
                  type: Type.STRING,
                  description:
                    'Possible public impact based on the reported issue details.',
                },
                recommendedAction: {
                  type: Type.STRING,
                  description:
                    'Suggested next administrative or field inspection action.',
                },
                imageAssessment: {
                  type: Type.STRING,
                  description:
                    'Honest assessment of the uploaded photo clarity and what is visible, or statement that no photo was supplied.',
                },
              },
              required: [
                'category',
                'severity',
                'explanation',
                'publicImpact',
                'recommendedAction',
                'imageAssessment',
              ],
            },
          },
        });

      const withTimeout = <T,>(promise: Promise<T>, ms = 15000): Promise<T> =>
        Promise.race([
          promise,
          new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI_TIMEOUT')), ms)),
        ]);

      let response;
      try {
        response = await withTimeout(callGenerate());
      } catch (firstErr) {
        const msg = firstErr instanceof Error ? firstErr.message : '';
        if (msg.includes('503') || msg.includes('UNAVAILABLE')) {
          await new Promise((resolve) => setTimeout(resolve, 650));
          response = await withTimeout(callGenerate());
        } else {
          throw firstErr;
        }
      }

      const rawText = response.text?.trim() ?? '';
      if (!rawText) {
        res.status(502).json({
          error: 'Neighbourhood Insights returned an empty response. Please try again or submit manually.',
          code: 'EMPTY_RESPONSE',
        });
        return;
      }

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(rawText) as Record<string, unknown>;
      } catch {
        res.status(502).json({
          error: 'Neighbourhood Insights returned an unreadable format. You can still submit manually.',
          code: 'PARSE_ERROR',
        });
        return;
      }

      const rawCategory = String(parsed.category ?? 'public_safety').toLowerCase().trim();
      const category = VALID_CATEGORIES.has(rawCategory) ? rawCategory : 'public_safety';

      const rawSeverity = String(parsed.severity ?? 'Medium').trim();
      const matchedSeverity = VALID_SEVERITIES.find(
        (s) => s.toLowerCase() === rawSeverity.toLowerCase()
      );
      const severity = matchedSeverity ?? 'Medium';

      res.json({
        category,
        severity,
        explanation:
          typeof parsed.explanation === 'string' && parsed.explanation.trim()
            ? parsed.explanation.trim()
            : 'Preliminary suggestion based on the submitted civic complaint details.',
        publicImpact:
          typeof parsed.publicImpact === 'string' && parsed.publicImpact.trim()
            ? parsed.publicImpact.trim()
            : 'Potential localized disruption to nearby pedestrians, commuters, or neighborhood utilities.',
        recommendedAction:
          typeof parsed.recommendedAction === 'string' && parsed.recommendedAction.trim()
            ? parsed.recommendedAction.trim()
            : 'Assign a ward field inspector to verify site conditions and dispatch the appropriate maintenance unit.',
        imageAssessment:
          typeof parsed.imageAssessment === 'string' && parsed.imageAssessment.trim()
            ? parsed.imageAssessment.trim()
            : imageBase64
              ? 'Image reviewed alongside the submitted complaint text.'
              : 'No photo uploaded; triage suggestion is based solely on the written description.',
        model: MODEL_NAME,
        analyzedAt: new Date().toISOString(),
        disclaimer:
          'AI-generated suggestion only — not verified facts, physical inspection findings, or an official municipal determination.',
      });
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'Unexpected server error during AI analysis.';
      console.error('Gemini analyze-issue error:', errMessage);

      if (errMessage === 'AI_TIMEOUT') {
        res.status(504).json({
          error: 'Neighbourhood Insights timed out. Your report can still be submitted manually.',
          code: 'AI_TIMEOUT',
        });
        return;
      }

      const status =
        errMessage.includes('403') || errMessage.includes('PERMISSION_DENIED')
          ? 403
          : errMessage.includes('429') || errMessage.includes('RESOURCE_EXHAUSTED')
            ? 429
            : errMessage.includes('503') || errMessage.includes('UNAVAILABLE')
              ? 503
              : errMessage.includes('404') || errMessage.includes('NOT_FOUND')
                ? 404
                : errMessage.includes('400') || errMessage.includes('INVALID_ARGUMENT')
                  ? 400
                  : 502;

      res.status(status).json({
        error:
          status === 429
            ? 'AI analysis rate limit reached. Your report can still be submitted with manual selection.'
            : status === 403
              ? 'Gemini API permission denied. Please verify the API key in Settings > Secrets; you can still submit manually.'
              : 'Neighbourhood Insights AI helper is temporarily unavailable. Your report can still be submitted manually.',
        code: 'AI_REQUEST_FAILED',
      });
    }
  });

  // Return predictable JSON errors for malformed API bodies instead of Express HTML pages.
  app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      next(error);
      return;
    }
    const isBodyError =
      typeof error === 'object' && error !== null &&
      ('type' in error) && (error as { type?: string }).type === 'entity.parse.failed';
    if (isBodyError) {
      res.status(400).json({ error: 'The request body is not valid JSON.', code: 'INVALID_JSON' });
      return;
    }
    console.error('Unhandled server middleware error:', error);
    res.status(500).json({ error: 'Unexpected server error.', code: 'INTERNAL_ERROR' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ApnaWard server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ApnaWard server:', err);
  process.exit(1);
});
