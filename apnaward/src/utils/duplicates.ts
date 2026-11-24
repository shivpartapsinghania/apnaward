import { CATEGORY_SHORT_LABELS, CivicIssue, DuplicateMatch, IssueCategory } from '../types/civic';
import { getDistanceMeters } from './hotspots';

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'near',
  'outside',
  'from',
  'into',
  'over',
  'road',
  'street',
  'lane',
  'main',
  'area',
  'ward',
  'issue',
  'report',
  'complaint',
  'demo',
  'very',
  'have',
  'been',
  'there',
  'their',
]);

function tokenize(text: string): Set<string> {
  const words = text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
  return new Set(words);
}

export interface DuplicateCandidateInput {
  title: string;
  category: IssueCategory;
  wardId: string;
  landmark: string;
  description: string;
  latitude: number;
  longitude: number;
}

export function findPotentialDuplicates(
  draft: DuplicateCandidateInput,
  existingIssues: CivicIssue[]
): DuplicateMatch[] {
  const cleanTitle = draft.title.trim();
  const cleanLandmark = draft.landmark.trim();
  const cleanDescription = draft.description.trim();

  if (!cleanTitle && !cleanLandmark && !cleanDescription) {
    return [];
  }

  const draftTokens = tokenize(`${cleanTitle} ${cleanLandmark} ${cleanDescription}`);
  const draftLocalityTokens = tokenize(cleanLandmark);

  const matches: DuplicateMatch[] = [];

  for (const existing of existingIssues) {
    const sameCategory = existing.category === draft.category;
    const sameWard = existing.wardId === draft.wardId;
    const distanceMeters = getDistanceMeters(
      draft.latitude,
      draft.longitude,
      existing.latitude,
      existing.longitude
    );

    const existingTokens = tokenize(
      `${existing.title} ${existing.landmark} ${existing.description}`
    );
    const existingLocalityTokens = tokenize(existing.landmark);

    const sharedTokens: string[] = [];
    for (const token of draftTokens) {
      if (existingTokens.has(token)) {
        sharedTokens.push(token);
      }
    }

    const sharedLocalityTokens: string[] = [];
    for (const token of draftLocalityTokens) {
      if (existingLocalityTokens.has(token)) {
        sharedLocalityTokens.push(token);
      }
    }

    let score = 0;
    const reasons: string[] = [];

    if (sameCategory) {
      score += 35;
      reasons.push(`Same category (${CATEGORY_SHORT_LABELS[existing.category]})`);
    }

    if (sameWard) {
      score += 20;
      reasons.push('Same ward');
    }

    if (distanceMeters <= 250) {
      score += 30;
      reasons.push(`Within ${distanceMeters}m of coordinates`);
    } else if (distanceMeters <= 600) {
      score += 18;
      reasons.push(`${distanceMeters}m away`);
    }

    if (sharedLocalityTokens.length > 0) {
      score += Math.min(25, sharedLocalityTokens.length * 14);
      reasons.push(`Matching locality terms: "${sharedLocalityTokens.slice(0, 3).join('", "')}"`);
    } else if (sharedTokens.length >= 2) {
      score += Math.min(20, sharedTokens.length * 7);
      reasons.push(`Shared keywords: "${sharedTokens.slice(0, 3).join('", "')}"`);
    }

    // Require meaningful overlap: same category + (same ward OR close proximity OR locality overlap),
    // or very tight same-spot overlap (<=120m + shared locality + 3+ shared keywords) when category differs
    const qualifies =
      (sameCategory &&
        (sameWard || distanceMeters <= 500 || sharedLocalityTokens.length > 0) &&
        score >= 55) ||
      (!sameCategory &&
        distanceMeters <= 120 &&
        sharedLocalityTokens.length >= 1 &&
        sharedTokens.length >= 3 &&
        score >= 65);

    if (qualifies) {
      matches.push({
        issue: existing,
        similarityScore: Math.min(99, score),
        distanceMeters,
        reasons,
      });
    }
  }

  return matches
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 3);
}
