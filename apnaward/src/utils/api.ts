import { AIInspectionResult, IssueCategory } from '../types/civic';

export interface AnalyzeIssueRequest {
  title?: string;
  description: string;
  area?: string;
  selectedCategory?: IssueCategory;
  imageBase64?: string;
  imageMimeType?: string;
}

export async function analyzeCivicIssue(
  payload: AnalyzeIssueRequest
): Promise<AIInspectionResult> {
  const response = await fetch('/api/analyze-issue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as Partial<AIInspectionResult> & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(
      data.error ||
        'Neighbourhood Insights could not complete analysis. You can proceed with manual submission.'
    );
  }

  return data as AIInspectionResult;
}

export function formatRelativeTime(isoDate: string): string {
  const timestamp = Date.parse(isoDate);
  if (!Number.isFinite(timestamp)) return 'Unknown';
  const diffMs = Math.max(0, Date.now() - timestamp);
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatDateTime(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
