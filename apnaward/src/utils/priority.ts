import {
  CATEGORY_SHORT_LABELS,
  CivicIssue,
  IssueCategory,
  IssueSeverity,
  IssueStatus,
  PriorityBreakdown,
} from '../types/civic';

interface ImpactKeywordRule {
  pattern: RegExp;
  label: string;
  points: number;
}

const IMPACT_RULES: ImpactKeywordRule[] = [
  {
    pattern: /\b(school|college|students|children|playground)\b/i,
    label: 'Near school or student zone (+10 pts)',
    points: 10,
  },
  {
    pattern: /\b(hospital|clinic|ambulance|emergency|pharmacy)\b/i,
    label: 'Medical or emergency access corridor (+10 pts)',
    points: 10,
  },
  {
    pattern: /\b(main road|highway|arterial|junction|intersection|crosswalk|bus stop|station)\b/i,
    label: 'High-traffic road or transit node (+8 pts)',
    points: 8,
  },
  {
    pattern: /\b(flood|flooding|submerged|standing water|slippery|overflow|sewage|drain|clogged)\b/i,
    label: 'Flooding, drainage, or slip hazard (+7 pts)',
    points: 7,
  },
  {
    pattern: /\b(dark|pitch black|unlit|night|elderly|pedestrian|wheelchair|wire|spark|exposed|open grate)\b/i,
    label: 'Pedestrian safety or hazard exposure (+7 pts)',
    points: 7,
  },
];

const CATEGORY_BASE_IMPACT: Record<IssueCategory, { points: number; label: string }> = {
  public_safety: { points: 15, label: 'Direct public safety exposure baseline (+15 pts)' },
  water_leakage: { points: 14, label: 'Utility & roadway integrity baseline (+14 pts)' },
  drainage: { points: 13, label: 'Stormwater & sanitation flow baseline (+13 pts)' },
  streetlight: { points: 12, label: 'Nighttime visibility safety baseline (+12 pts)' },
  road_damage: { points: 11, label: 'Vehicular & commuter hazard baseline (+11 pts)' },
  waterlogging: { points: 13, label: 'Monsoon/waterlogging mobility & health baseline (+13 pts)' },
  garbage: { points: 9, label: 'Sanitation & public hygiene baseline (+9 pts)' },
  other: { points: 8, label: 'General civic infrastructure baseline (+8 pts)' },
};

export function calculateSmartPriority(params: {
  title?: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  description: string;
  landmark?: string;
  createdAt: string;
  communityVerifications?: number;
  referenceTimeMs?: number;
}): PriorityBreakdown {
  const {
    title = '',
    category,
    severity,
    status,
    description,
    landmark = '',
    createdAt,
    referenceTimeMs,
  } = params;

  // 1. Severity Factor (0 - 45 points)
  let severityPoints = 10;
  let severityReason = 'Low severity selected: routine maintenance priority (10 / 45 pts).';
  if (severity === 'Critical') {
    severityPoints = 45;
    severityReason = 'Critical severity selected: urgent potential hazard requiring rapid verification (45 / 45 pts).';
  } else if (severity === 'High') {
    severityPoints = 36;
    severityReason = 'High severity selected: substantial safety or service disruption risk (36 / 45 pts).';
  } else if (severity === 'Medium') {
    severityPoints = 22;
    severityReason = 'Medium severity selected: moderate localized disruption (22 / 45 pts).';
  }

  // 2. Potential Public Impact Factor (0 - 35 points)
  const baseImpact = CATEGORY_BASE_IMPACT[category] ?? CATEGORY_BASE_IMPACT.public_safety;
  const impactFactors: string[] = [
    `${CATEGORY_SHORT_LABELS[category] ?? 'Issue'}: ${baseImpact.label}`,
  ];
  let impactPoints = baseImpact.points;

  const combinedText = `${title} ${description} ${landmark}`;
  for (const rule of IMPACT_RULES) {
    if (rule.pattern.test(combinedText)) {
      impactPoints += rule.points;
      impactFactors.push(rule.label);
    }
  }
  impactPoints = Math.min(35, impactPoints);

  // 3. Waiting Time Factor (0 - 20 points)
  const nowMs = referenceTimeMs ?? Date.now();
  const createdMs = Date.parse(createdAt);
  const elapsedMs = Number.isFinite(createdMs) ? Math.max(0, nowMs - createdMs) : 0;
  const waitingHours = Math.round(elapsedMs / (1000 * 60 * 60));

  let waitingPoints = 0;
  let waitingReason = '';

  if (status === 'Resolved') {
    waitingPoints = 0;
    waitingReason = `Issue resolved (${waitingHours}h total lifecycle); active queue wait penalty cleared (0 / 20 pts).`;
  } else {
    waitingPoints = Math.min(20, Math.floor(waitingHours / 6));
    if (waitingHours < 6) {
      waitingReason = `Reported ${waitingHours}h ago; under 6h threshold (0 / 20 pts).`;
    } else {
      waitingReason = `Open for ${waitingHours}h (+1 pt per 6h open, capped at 20 pts): ${waitingPoints} / 20 pts.`;
    }
  }

  const totalScore = Math.min(100, severityPoints + impactPoints + waitingPoints);

  let band: PriorityBreakdown['band'] = 'Standard';
  if (totalScore >= 82) {
    band = 'Critical';
  } else if (totalScore >= 65) {
    band = 'High';
  } else if (totalScore >= 45) {
    band = 'Elevated';
  }

  const summary =
    status === 'Resolved'
      ? `Resolved complaint scored ${totalScore}/100 from historical severity (${severityPoints} pts) and public impact (${impactPoints} pts).`
      : `Scored ${totalScore}/100 from ${severity} severity (${severityPoints} pts), ${impactFactors.length} public impact factor${impactFactors.length > 1 ? 's' : ''} (${impactPoints} pts), and ${waitingHours}h wait (${waitingPoints} pts).`;

  return {
    totalScore,
    band,
    severityPoints,
    severityReason,
    impactPoints,
    impactFactors,
    waitingPoints,
    waitingHours,
    waitingReason,
    summary,
  };
}

export function getIssuePriority(issue: CivicIssue, referenceTimeMs?: number): PriorityBreakdown {
  return calculateSmartPriority({
    title: issue.title,
    category: issue.category,
    severity: issue.severity,
    status: issue.status,
    description: issue.description,
    landmark: issue.landmark,
    createdAt: issue.createdAt,
    communityVerifications: issue.communityVerifications,
    referenceTimeMs,
  });
}
