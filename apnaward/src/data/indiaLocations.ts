/**
 * Country-wide top-level location catalogue for ApnaWard.
 * Districts, cities, wards and localities are intentionally database-managed;
 * their names/boundaries differ by state and local body and must not be guessed.
 */
export interface IndiaStateOption {
  code: string;
  name: string;
  type: 'state' | 'union_territory';
}

export const INDIA_STATES_AND_UTS: IndiaStateOption[] = [
  { code: 'AN', name: 'Andaman and Nicobar Islands', type: 'union_territory' },
  { code: 'AP', name: 'Andhra Pradesh', type: 'state' },
  { code: 'AR', name: 'Arunachal Pradesh', type: 'state' },
  { code: 'AS', name: 'Assam', type: 'state' },
  { code: 'BR', name: 'Bihar', type: 'state' },
  { code: 'CH', name: 'Chandigarh', type: 'union_territory' },
  { code: 'CT', name: 'Chhattisgarh', type: 'state' },
  { code: 'DH', name: 'Dadra and Nagar Haveli and Daman and Diu', type: 'union_territory' },
  { code: 'DL', name: 'Delhi', type: 'union_territory' },
  { code: 'GA', name: 'Goa', type: 'state' },
  { code: 'GJ', name: 'Gujarat', type: 'state' },
  { code: 'HR', name: 'Haryana', type: 'state' },
  { code: 'HP', name: 'Himachal Pradesh', type: 'state' },
  { code: 'JK', name: 'Jammu and Kashmir', type: 'union_territory' },
  { code: 'JH', name: 'Jharkhand', type: 'state' },
  { code: 'KA', name: 'Karnataka', type: 'state' },
  { code: 'KL', name: 'Kerala', type: 'state' },
  { code: 'LA', name: 'Ladakh', type: 'union_territory' },
  { code: 'LD', name: 'Lakshadweep', type: 'union_territory' },
  { code: 'MP', name: 'Madhya Pradesh', type: 'state' },
  { code: 'MH', name: 'Maharashtra', type: 'state' },
  { code: 'MN', name: 'Manipur', type: 'state' },
  { code: 'ML', name: 'Meghalaya', type: 'state' },
  { code: 'MZ', name: 'Mizoram', type: 'state' },
  { code: 'NL', name: 'Nagaland', type: 'state' },
  { code: 'OD', name: 'Odisha', type: 'state' },
  { code: 'PY', name: 'Puducherry', type: 'union_territory' },
  { code: 'PB', name: 'Punjab', type: 'state' },
  { code: 'RJ', name: 'Rajasthan', type: 'state' },
  { code: 'SK', name: 'Sikkim', type: 'state' },
  { code: 'TN', name: 'Tamil Nadu', type: 'state' },
  { code: 'TS', name: 'Telangana', type: 'state' },
  { code: 'TR', name: 'Tripura', type: 'state' },
  { code: 'UP', name: 'Uttar Pradesh', type: 'state' },
  { code: 'UK', name: 'Uttarakhand', type: 'state' },
  { code: 'WB', name: 'West Bengal', type: 'state' },
];

export type IndiaLocationLevel = 'state' | 'district' | 'city' | 'ward' | 'locality';

export interface IndiaLocationRecord {
  id: string;
  parentId: string | null;
  level: IndiaLocationLevel;
  code?: string | null;
  name: string;
  stateCode: string;
  latitude?: number | null;
  longitude?: number | null;
  isDemo?: boolean;
}

/**
 * Minimal illustrative demo hierarchy used ONLY when Supabase locations are not configured.
 * Clearly marked isDemo: true — never presented as an official Pan-India ward catalogue.
 */
export const DEMO_LOCATION_RECORDS: IndiaLocationRecord[] = [
  { id: 'demo-dist-ka-blr', parentId: null, level: 'district', name: 'Bengaluru Urban (Demo)', stateCode: 'KA', isDemo: true },
  { id: 'demo-city-ka-blr', parentId: 'demo-dist-ka-blr', level: 'city', name: 'Bengaluru City (Demo)', stateCode: 'KA', latitude: 12.9716, longitude: 77.5946, isDemo: true },
  { id: 'ward-1', parentId: 'demo-city-ka-blr', level: 'ward', name: 'Ward 1 · North Market (Demo)', stateCode: 'KA', latitude: 12.9815, longitude: 77.5946, isDemo: true },
  { id: 'ward-2', parentId: 'demo-city-ka-blr', level: 'ward', name: 'Ward 2 · Station Road (Demo)', stateCode: 'KA', latitude: 12.9762, longitude: 77.5713, isDemo: true },
  { id: 'ward-3', parentId: 'demo-city-ka-blr', level: 'ward', name: 'Ward 3 · Riverside Colony (Demo)', stateCode: 'KA', latitude: 12.9668, longitude: 77.6062, isDemo: true },
  { id: 'ward-4', parentId: 'demo-city-ka-blr', level: 'ward', name: 'Ward 4 · Lakeview East (Demo)', stateCode: 'KA', latitude: 12.9735, longitude: 77.6248, isDemo: true },
  { id: 'ward-5', parentId: 'demo-city-ka-blr', level: 'ward', name: 'Ward 5 · Industrial Corridor (Demo)', stateCode: 'KA', latitude: 12.9584, longitude: 77.5844, isDemo: true },
  { id: 'ward-6', parentId: 'demo-city-ka-blr', level: 'ward', name: 'Ward 6 · Civic Center (Demo)', stateCode: 'KA', latitude: 12.9716, longitude: 77.5946, isDemo: true },
];
