# ApnaWard — Pan-India Configuration Plan

## Product rule

Build one configurable platform, not one hard-coded city app. Do not ship invented ward names, boundaries, officials, phone numbers or service promises.

## Location hierarchy

`India → State / UT → District → City / Urban Local Body → Ward → Locality`

The current code includes a State/UT name catalogue. The database schema supports hierarchical location records. It does not contain a verified national district/city/ward directory or authoritative polygon boundaries.

## Data onboarding for each city

1. Identify the responsible urban local body and the official source of its ward/locality catalogue.
2. Confirm administrative hierarchy, official names, codes, effective dates and boundary format.
3. Import and validate parent-child relationships before publishing the catalogue.
4. Store source, retrieval date, licence/permission and a data steward for every imported dataset.
5. Validate geometry (coordinate reference system, invalid polygons, overlaps and gaps) before using it for map assignment.
6. Assign operator accounts to the smallest operational scope required.
7. Run a limited pilot with explicit local-body permission and a clear escalation process.

## Safe defaults

- Unknown location: allow a report to be saved as unassigned for human review; do not guess a ward.
- Unverified boundary: show a pin and a “location not verified” label; do not claim automatic ward assignment.
- No municipal API: keep the product as a resident-to-community workflow; do not imply official dispatch.
- No verified local contacts: do not show invented helplines or emergency escalation details.
- Location updates: retain source and version metadata so a ward-boundary change can be audited.

## Database scope contract in the current SQL foundation

- `locations.parent_id` models the hierarchy.
- `civic_issues.location_id` is expected to reference the selected ward-level location for `ward_admin` authorization.
- `profiles.ward_id` scopes a ward administrator.
- `profiles.state_code + city_name` scopes a city administrator.
- `platform_admin` has global operator scope.

The UI currently uses illustrative local demo wards and localStorage. The above contract is a backend foundation, not a claim that end-to-end assignment is implemented.
