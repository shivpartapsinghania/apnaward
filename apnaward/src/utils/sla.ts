import type { CivicIssue, IssueSeverity } from '../types/civic';

export interface SlaStatus {
  targetHours: number;
  elapsedHours: number;
  remainingHours: number;
  isOverdue: boolean;
  state: 'resolved' | 'on_track' | 'due_soon' | 'overdue';
  label: string;
}

const SLA_TARGET_HOURS: Record<IssueSeverity, number> = {
  Critical: 24,
  High: 48,
  Medium: 72,
  Low: 120,
};

export function calculateIssueSla(issue: Pick<CivicIssue, 'severity' | 'status' | 'createdAt' | 'updatedAt'>, nowMs = Date.now()): SlaStatus {
  const targetHours = SLA_TARGET_HOURS[issue.severity] ?? 72;
  const createdMs = Date.parse(issue.createdAt);
  const endMs = issue.status === 'Resolved' ? Date.parse(issue.updatedAt) || nowMs : nowMs;
  const elapsedHours = Number.isFinite(createdMs) ? Math.max(0, Math.round((endMs - createdMs) / 3600000)) : 0;
  const remainingHours = targetHours - elapsedHours;

  if (issue.status === 'Resolved') {
    return {
      targetHours,
      elapsedHours,
      remainingHours,
      isOverdue: elapsedHours > targetHours,
      state: 'resolved',
      label: elapsedHours <= targetHours ? `Resolved in ${elapsedHours}h (within ${targetHours}h target)` : `Resolved in ${elapsedHours}h`,
    };
  }

  if (remainingHours < 0) {
    return {
      targetHours,
      elapsedHours,
      remainingHours,
      isOverdue: true,
      state: 'overdue',
      label: `Overdue by ${Math.abs(remainingHours)}h (${targetHours}h target)`,
    };
  }

  if (remainingHours <= Math.round(targetHours * 0.25)) {
    return {
      targetHours,
      elapsedHours,
      remainingHours,
      isOverdue: false,
      state: 'due_soon',
      label: `Due soon · ${remainingHours}h left (${targetHours}h target)`,
    };
  }

  return {
    targetHours,
    elapsedHours,
    remainingHours,
    isOverdue: false,
    state: 'on_track',
    label: `On track · ${remainingHours}h left (${targetHours}h target)`,
  };
}
