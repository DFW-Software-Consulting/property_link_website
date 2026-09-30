/** Location and building choices for the contact form. */

/** A published building the visitor can pick on the contact form. */
export type BuildingOption = {
  slug: string;
  name: string;
  neighborhood: string | null;
};

/** Buildings to offer once a location is chosen; every building when it isn't. */
export function buildingsInNeighborhood(
  buildings: readonly BuildingOption[],
  neighborhood: string | undefined,
): BuildingOption[] {
  if (!neighborhood) return [...buildings];
  return buildings.filter((b) => b.neighborhood === neighborhood);
}
