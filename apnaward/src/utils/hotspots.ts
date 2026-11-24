import {
  CATEGORY_SHORT_LABELS,
  CivicIssue,
  HotspotCluster,
  IssueCategory,
  IssueSeverity,
} from '../types/civic';
import { getIssuePriority } from './priority';

const EARTH_RADIUS_METERS = 6371000;

const SEVERITY_RANK: Record<IssueSeverity, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

export function getDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_METERS * c);
}

function buildSuggestedAttention(
  dominantCategory: IssueCategory,
  highestSeverity: IssueSeverity,
  openCount: number,
  wardName: string
): string {
  const cleanWard = wardName.replace(' (Demo)', '');
  const urgencyPrefix =
    highestSeverity === 'Critical' || highestSeverity === 'High'
      ? `Prioritize rapid field verification in ${cleanWard}`
      : `Schedule consolidated maintenance sweep in ${cleanWard}`;

  switch (dominantCategory) {
    case 'road_damage':
      return `${urgencyPrefix}: inspect pavement integrity, place temporary hazard cones where needed, and batch road patching.`;
    case 'water_leakage':
      return `${urgencyPrefix}: dispatch waterworks team to check isolation valves, joint pressure, and pedestrian runoff.`;
    case 'drainage':
      return `${urgencyPrefix}: clear storm grates/catch basins and inspect missing covers to reduce localized waterlogging.`;
    case 'streetlight':
      return `${urgencyPrefix}: assign electrical crew to audit feeder lines, poles, and dusk-to-dawn sensors together.`;
    case 'garbage':
      return `${urgencyPrefix}: deploy compactor sweep and evaluate secondary bin capacity along the corridor.`;
    case 'public_safety':
      return `${urgencyPrefix}: review signage, pedestrian sightlines, and barrier placement with ward field staff.`;
  }

  return `${urgencyPrefix} across ${openCount} open nearby reports.`;
}

export function detectHotspots(
  issues: CivicIssue[],
  options: { radiusMeters?: number; minCount?: number; openOnly?: boolean } = {}
): HotspotCluster[] {
  const radiusMeters = options.radiusMeters ?? 450;
  const minCount = options.minCount ?? 2;
  const openOnly = options.openOnly ?? false;

  const pool = openOnly ? issues.filter((i) => i.status !== 'Resolved') : issues;
  if (pool.length < minCount) return [];

  const visited = new Set<string>();
  const clusters: HotspotCluster[] = [];

  for (let i = 0; i < pool.length; i += 1) {
    const seed = pool[i];
    if (visited.has(seed.id)) continue;

    // Connected-component BFS grouping for points within radiusMeters
    const queue: CivicIssue[] = [seed];
    const group: CivicIssue[] = [];
    visited.add(seed.id);

    while (queue.length > 0) {
      const current = queue.shift()!;
      group.push(current);

      for (let j = 0; j < pool.length; j += 1) {
        const candidate = pool[j];
        if (visited.has(candidate.id)) continue;
        const dist = getDistanceMeters(
          current.latitude,
          current.longitude,
          candidate.latitude,
          candidate.longitude
        );
        if (dist <= radiusMeters) {
          visited.add(candidate.id);
          queue.push(candidate);
        }
      }
    }

    if (group.length < minCount) continue;

    const centerLat =
      group.reduce((sum, item) => sum + item.latitude, 0) / group.length;
    const centerLng =
      group.reduce((sum, item) => sum + item.longitude, 0) / group.length;

    const catCounts = new Map<IssueCategory, number>();
    const wardCounts = new Map<string, { count: number; wardName: string }>();
    let highestSeverity: IssueSeverity = 'Low';

    for (const item of group) {
      catCounts.set(item.category, (catCounts.get(item.category) ?? 0) + 1);
      const existingWard = wardCounts.get(item.wardId);
      wardCounts.set(item.wardId, {
        count: (existingWard?.count ?? 0) + 1,
        wardName: item.wardName,
      });
      if (SEVERITY_RANK[item.severity] > SEVERITY_RANK[highestSeverity]) {
        highestSeverity = item.severity;
      }
    }

    let dominantCategory: IssueCategory = group[0].category;
    let maxCatCount = 0;
    for (const [cat, count] of catCounts.entries()) {
      if (count > maxCatCount) {
        dominantCategory = cat;
        maxCatCount = count;
      }
    }

    let primaryWardId = group[0].wardId;
    let primaryWardName = group[0].wardName;
    let maxWardCount = 0;
    for (const [wId, info] of wardCounts.entries()) {
      if (info.count > maxWardCount) {
        primaryWardId = wId;
        primaryWardName = info.wardName;
        maxWardCount = info.count;
      }
    }

    const representativeLandmark = group
      .slice()
      .sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity])[0]
      .landmark;

    const cleanWard = primaryWardName.replace(' (Demo)', '');
    const areaName = `${cleanWard} — ${representativeLandmark}`;

    const openCount = group.filter((g) => g.status !== 'Resolved').length;
    const avgPriorityScore = Math.round(
      group.reduce((sum, item) => sum + getIssuePriority(item).totalScore, 0) /
        group.length
    );

    const maxSpread = group.reduce((maxDist, item) => {
      const d = getDistanceMeters(centerLat, centerLng, item.latitude, item.longitude);
      return Math.max(maxDist, d);
    }, 0);

    clusters.push({
      id: `hs-${primaryWardId}-${clusters.length + 1}`,
      areaName,
      wardId: primaryWardId,
      wardName: primaryWardName,
      centerLat: Number(centerLat.toFixed(5)),
      centerLng: Number(centerLng.toFixed(5)),
      radiusMeters: Math.max(180, maxSpread + 90),
      complaintCount: group.length,
      openCount,
      dominantCategory,
      highestSeverity,
      avgPriorityScore,
      issueIds: group.map((g) => g.id),
      suggestedAttention: buildSuggestedAttention(
        dominantCategory,
        highestSeverity,
        openCount,
        primaryWardName
      ),
      groupingRuleSummary: `Grouped ${group.length} ${openOnly ? 'open ' : ''}complaints within ${radiusMeters}m Haversine proximity (dominant: ${CATEGORY_SHORT_LABELS[dominantCategory]}).`,
    });
  }

  return clusters.sort((a, b) => {
    if (b.openCount !== a.openCount) return b.openCount - a.openCount;
    if (SEVERITY_RANK[b.highestSeverity] !== SEVERITY_RANK[a.highestSeverity]) {
      return SEVERITY_RANK[b.highestSeverity] - SEVERITY_RANK[a.highestSeverity];
    }
    return b.complaintCount - a.complaintCount;
  });
}
