import type { CivicIssue } from '../types/civic';

const OFFLINE_QUEUE_KEY = 'apnaward_offline_outbox_v1';

export type OfflineSyncStatus = 'pending' | 'syncing' | 'failed';

export interface OfflineDraftRecord {
  localId: string;
  queuedAt: string;
  status: OfflineSyncStatus;
  retryCount: number;
  lastError?: string;
  issue: CivicIssue;
}

function saveQueue(records: OfflineDraftRecord[]): void {
  try {
    window.localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(records));
  } catch {
    // ignore storage quota failure
  }
}

export function loadOfflineQueue(): OfflineDraftRecord[] {
  try {
    const raw = window.localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as OfflineDraftRecord[]) : [];
  } catch {
    return [];
  }
}

export function enqueueOfflineIssue(issue: CivicIssue): OfflineDraftRecord[] {
  const current = loadOfflineQueue();
  const next: OfflineDraftRecord[] = [
    {
      localId: issue.id,
      queuedAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
      issue,
    },
    ...current.filter((item) => item.localId !== issue.id),
  ];
  saveQueue(next);
  return next;
}

export function markOfflineFailed(localId: string, errorMessage: string): OfflineDraftRecord[] {
  const next = loadOfflineQueue().map((item) =>
    item.localId === localId
      ? {
          ...item,
          status: 'failed' as const,
          retryCount: (item.retryCount ?? 0) + 1,
          lastError: errorMessage,
        }
      : item
  );
  saveQueue(next);
  return next;
}

export function removeOfflineIssue(localId: string): OfflineDraftRecord[] {
  const next = loadOfflineQueue().filter((item) => item.localId !== localId);
  saveQueue(next);
  return next;
}
