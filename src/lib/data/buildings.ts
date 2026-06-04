/**
 * Managed-portfolio buildings shown in the Maintenance Request dropdown.
 * The selected entry's text is what gets written verbatim into the email
 * payload's `building` field, so the property-management app keys off these
 * exact strings — keep them stable and in sync with that side.
 */
export const BUILDINGS: readonly string[] = [
  "200 Mott Street — Little Italy",
  "92 Mulberry Street — Little Italy",
  "45 Wall Street — Financial District",
  "100 Maiden Lane — Financial District",
  "315 West 48th Street — Hell's Kitchen",
  "521 West 48th Street — Hell's Kitchen",
  "245 East 63rd Street — Upper East Side",
  "330 East 79th Street — Upper East Side",
  "150 East 34th Street — Murray Hill",
  "275 West 96th Street — Upper West Side",
];
