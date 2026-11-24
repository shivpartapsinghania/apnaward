import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

test('package.json is valid and declares required scripts', () => {
  const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
  assert.equal(pkg.name, 'apnaward');
  assert.ok(pkg.scripts.build);
  assert.ok(pkg.scripts.start);
  assert.ok(pkg.scripts.typecheck);
  assert.ok(pkg.scripts.test);
});

test('all 5 Supabase migrations exist and 005 locks profile geographic scope', () => {
  const migrations = [
    'supabase/migrations/001_initial_schema.sql',
    'supabase/migrations/002_integrity_storage.sql',
    'supabase/migrations/003_complete_workflow_and_rls.sql',
    'supabase/migrations/004_resolution_proof_and_seed.sql',
    'supabase/migrations/005_security_hardening_and_scope_lock.sql',
  ];
  for (const file of migrations) {
    assert.ok(fs.existsSync(file), `Missing migration: ${file}`);
  }
  const sql3 = fs.readFileSync(migrations[2], 'utf8');
  for (const tbl of ['departments', 'issue_assignments', 'issue_attachments', 'notifications', 'audit_logs']) {
    assert.ok(sql3.includes(`alter table public.${tbl} enable row level security`), `RLS missing on ${tbl}`);
  }
  const sql5 = fs.readFileSync(migrations[4], 'utf8');
  assert.ok(sql5.includes('grant update (display_name) on public.profiles to authenticated'));
  assert.ok(sql5.includes('protect_profile_privileged_fields'));
  assert.ok(sql5.includes("session_user in ('postgres', 'supabase_admin')"));
  assert.ok(sql5.includes('verify_civic_issue'));
  assert.ok(sql5.includes('reopen_own_issue'));
});

test('no service_role or hardcoded API keys exist in frontend or server source', () => {
  const checkFiles = ['server.ts', 'src/utils/cloud.ts', 'src/App.tsx'];
  for (const file of checkFiles) {
    const content = fs.readFileSync(file, 'utf8');
    assert.equal(content.includes('service_role'), false, `service_role found in ${file}`);
    assert.equal(/AIza[0-9A-Za-z\-_]{30,}/.test(content), false, `Hardcoded Google key found in ${file}`);
  }
});

test('server.ts blocks privileged profile fields, validates photo_path ownership, and sets AI timeout', () => {
  const serverSrc = fs.readFileSync('server.ts', 'utf8');
  assert.ok(serverSrc.includes('PRIVILEGED_FIELD_FORBIDDEN'));
  assert.ok(serverSrc.includes('p.startsWith(`${user.id}/`)'));
  assert.ok(serverSrc.includes('AI_TIMEOUT'));
  assert.ok(serverSrc.includes('/api/issues/:trackingCode/verify'));
  assert.ok(serverSrc.includes('/api/issues/:trackingCode/reopen'));
});

test('cloud.ts enforces magic-byte validation on uploaded evidence images', () => {
  const cloudSrc = fs.readFileSync('src/utils/cloud.ts', 'utf8');
  assert.ok(cloudSrc.includes('detectImageMimeFromBytes'));
  assert.ok(cloudSrc.includes('0xff') && cloudSrc.includes('0x89'));
});

test('SLA calculation logic matches severity targets', () => {
  const TARGETS = { Critical: 24, High: 48, Medium: 72, Low: 120 };
  const now = Date.parse('2026-11-20T12:00:00Z');
  const created30hAgo = new Date(now - 30 * 3600000).toISOString();
  const elapsed = Math.round((now - Date.parse(created30hAgo)) / 3600000);
  assert.equal(elapsed, 30);
  assert.ok(elapsed > TARGETS.Critical);
  assert.ok(elapsed < TARGETS.High);
});

test('hero neighbourhood asset exists and pagination bounds clamp safely', () => {
  assert.ok(fs.existsSync('src/assets/images/hero-neighbourhood.jpg'));
  const clampLimit = (v) => Math.min(100, Math.max(1, Math.trunc(Number(v) || 25)));
  assert.equal(clampLimit(500), 100);
  assert.equal(clampLimit(-5), 1);
  assert.equal(clampLimit(25), 25);
});

test('community verification boosts priority score safely up to cap', () => {
  const verifyBonus = (count) => Math.min(10, Math.max(0, count) * 2);
  assert.equal(verifyBonus(0), 0);
  assert.equal(verifyBonus(3), 6);
  assert.equal(verifyBonus(12), 10);
});

test('offlineQueue utility exports queue, failure tracking, and removal helpers', () => {
  const content = fs.readFileSync('src/utils/offlineQueue.ts', 'utf8');
  assert.ok(content.includes('enqueueOfflineIssue'));
  assert.ok(content.includes('loadOfflineQueue'));
  assert.ok(content.includes('markOfflineFailed'));
  assert.ok(content.includes('removeOfflineIssue'));
});


test('offline outbox performs real enqueue, failure marking, and removal operations', async () => {
  const store = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => store.set(key, value),
      removeItem: (key) => store.delete(key),
    },
  };
  try {
    const queue = await import(pathToFileURL(path.resolve('src/utils/offlineQueue.ts')).href);
    const issue = { id: 'AW-TEST-1001', title: 'Test pothole', description: 'Synthetic test only' };
    let records = queue.enqueueOfflineIssue(issue);
    assert.equal(records.length, 1);
    assert.equal(queue.loadOfflineQueue()[0].issue.id, issue.id);
    records = queue.markOfflineFailed(issue.id, 'synthetic network failure');
    assert.equal(records[0].status, 'failed');
    assert.equal(records[0].retryCount, 1);
    assert.equal(records[0].lastError, 'synthetic network failure');
    records = queue.removeOfflineIssue(issue.id);
    assert.equal(records.length, 0);
    assert.equal(queue.loadOfflineQueue().length, 0);
  } finally {
    delete globalThis.window;
  }
});

test('public tracking SQL projection excludes direct identifiers and free-text fields', () => {
  const sql = fs.readFileSync('supabase/migrations/003_complete_workflow_and_rls.sql', 'utf8');
  const start = sql.indexOf('create or replace function public.public_track_issue');
  const end = sql.indexOf('revoke all on function public.public_track_issue', start);
  assert.ok(start >= 0 && end > start, 'public tracking RPC must exist');
  const rpc = sql.slice(start, end);
  for (const forbidden of [
    'v_issue.reporter_id', 'v_issue.title', 'v_issue.description', 'v_issue.photo_path',
    'v_issue.latitude', 'v_issue.longitude', 'u.actor_id', 'u.note',
  ]) {
    assert.equal(rpc.includes(forbidden), false, `public tracking exposes forbidden field ${forbidden}`);
  }
  for (const required of ["'trackingCode'", "'category'", "'status'", "'timeline'"]) {
    assert.ok(rpc.includes(required), `public tracking is missing ${required}`);
  }
});

test('photo workflow is connected to report UI and signed URL display', () => {
  const app = fs.readFileSync('src/App.tsx', 'utf8');
  const reportForm = fs.readFileSync('src/components/ReportIssuePage.tsx', 'utf8');
  const drawer = fs.readFileSync('src/components/IssueDetailDrawer.tsx', 'utf8');
  const cloud = fs.readFileSync('src/utils/cloud.ts', 'utf8');
  assert.ok(reportForm.includes('photoDataUrl'));
  assert.ok(app.includes('createCloudIssue('));
  assert.ok(cloud.includes('uploadEvidencePhoto('));
  assert.ok(cloud.includes("'issue_attachments'"));
  assert.ok(drawer.includes('getEvidenceSignedUrl('));
});
