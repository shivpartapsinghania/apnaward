export type IssueCategory =
  | 'road_damage'
  | 'garbage'
  | 'water_leakage'
  | 'streetlight'
  | 'drainage'
  | 'waterlogging'
  | 'public_safety'
  | 'other';

export type IssueSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type IssueStatus =
  | 'Submitted'
  | 'Reported'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Rejected'
  | 'Reopened';

export type UserRole = 'resident' | 'ward_admin' | 'city_admin' | 'platform_admin';

export interface UserProfile {
  id: string;
  display_name: string;
  role: UserRole;
  state_code: string | null;
  district_name: string | null;
  city_name: string | null;
  ward_id: string | null;
}

export type NavSection =
  | 'home'
  | 'command'
  | 'overview'
  | 'report'
  | 'track'
  | 'inspector'
  | 'map'
  | 'management'
  | 'priority';

export type HomeAnchorId =
  | 'home-intro'
  | 'why-apnaward'
  | 'how-it-works'
  | 'ward-glance'
  | 'platform-features'
  | 'trust-transparency';

export interface HotspotCluster {
  id: string;
  areaName: string;
  wardId: string;
  wardName: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  complaintCount: number;
  openCount: number;
  dominantCategory: IssueCategory;
  highestSeverity: IssueSeverity;
  avgPriorityScore: number;
  issueIds: string[];
  suggestedAttention: string;
  groupingRuleSummary: string;
}

export interface DuplicateMatch {
  issue: CivicIssue;
  similarityScore: number;
  distanceMeters: number;
  reasons: string[];
}

export interface StatusTimelineEntry {
  id: string;
  previousStatus?: IssueStatus;
  status: IssueStatus;
  timestamp: string;
  actor: string;
  note: string;
}

export interface AIInspectionResult {
  category: IssueCategory;
  severity: IssueSeverity;
  explanation: string;
  publicImpact: string;
  recommendedAction: string;
  imageAssessment: string;
  model: string;
  analyzedAt: string;
  disclaimer: string;
}

export interface PriorityBreakdown {
  totalScore: number;
  band: 'Critical' | 'High' | 'Elevated' | 'Standard';
  severityPoints: number;
  severityReason: string;
  impactPoints: number;
  impactFactors: string[];
  waitingPoints: number;
  waitingHours: number;
  waitingReason: string;
  summary: string;
}

export interface CivicIssue {
  id: string;
  title: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  locationId?: string;
  stateCode?: string;
  districtName?: string;
  cityName?: string;
  wardId: string;
  wardName: string;
  localityName?: string;
  landmark: string;
  description: string;
  latitude: number;
  longitude: number;
  photoDataUrl?: string;
  photoPath?: string;
  evidenceWarning?: string;
  resolutionPhotoDataUrl?: string;
  resolutionPhotoPath?: string;
  communityVerifications?: number;
  isDemoData: boolean;
  createdAt: string;
  updatedAt: string;
  aiAnalysis?: AIInspectionResult;
  aiSuggestionEdited?: boolean;
  aiUnavailableFallback?: boolean;
  timeline: StatusTimelineEntry[];
}

export interface WardInfo {
  id: string;
  name: string;
  shortName: string;
  centerLat: number;
  centerLng: number;
}

export const CATEGORY_LABELS: Record<IssueCategory, string> = {
  road_damage: 'Road Damage',
  garbage: 'Garbage',
  water_leakage: 'Water Supply & Leakage',
  streetlight: 'Streetlight',
  drainage: 'Drainage',
  waterlogging: 'Waterlogging',
  public_safety: 'Public Infrastructure',
  other: 'Other Civic Issue',
};

export const CATEGORY_SHORT_LABELS: Record<IssueCategory, string> = {
  road_damage: 'Road Damage',
  garbage: 'Garbage',
  water_leakage: 'Water Supply',
  streetlight: 'Streetlight',
  drainage: 'Drainage',
  waterlogging: 'Waterlogging',
  public_safety: 'Infrastructure',
  other: 'Other',
};

export const ILLUSTRATIVE_WARDS: WardInfo[] = [
  {
    id: 'ward-1',
    name: 'Ward 1 · North Market (Demo)',
    shortName: 'Ward 1 · North Market',
    centerLat: 12.9815,
    centerLng: 77.5946,
  },
  {
    id: 'ward-2',
    name: 'Ward 2 · Station Road (Demo)',
    shortName: 'Ward 2 · Station Road',
    centerLat: 12.9762,
    centerLng: 77.5713,
  },
  {
    id: 'ward-3',
    name: 'Ward 3 · Riverside Colony (Demo)',
    shortName: 'Ward 3 · Riverside',
    centerLat: 12.9668,
    centerLng: 77.6062,
  },
  {
    id: 'ward-4',
    name: 'Ward 4 · Lakeview East (Demo)',
    shortName: 'Ward 4 · Lakeview East',
    centerLat: 12.9735,
    centerLng: 77.6248,
  },
  {
    id: 'ward-5',
    name: 'Ward 5 · Industrial Corridor (Demo)',
    shortName: 'Ward 5 · Industrial',
    centerLat: 12.9584,
    centerLng: 77.5844,
  },
  {
    id: 'ward-6',
    name: 'Ward 6 · Civic Center (Demo)',
    shortName: 'Ward 6 · Civic Center',
    centerLat: 12.9716,
    centerLng: 77.5946,
  },
];
