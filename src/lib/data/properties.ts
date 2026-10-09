export type Property = {
  slug: string;
  name: string;
  neighborhood: string;
  image: string;
  blurb: string;
};

/** The eight PropertyLink-owned buildings featured across the site. */
export const properties: Property[] = [
  {
    slug: "138-bowery",
    name: "138 Bowery",
    neighborhood: "Bowery",
    image: "/images/properties/138-bowery.jpg",
    blurb:
      "A historic Bowery streetscape steps from the Grand St subway, with SoHo and NoHo at your door.",
  },
  {
    slug: "521-west-48",
    name: "521 West 48th Street",
    neighborhood: "Hell's Kitchen",
    image: "/images/properties/521-west-48.jpg",
    blurb:
      "Elevator building with a roof deck, minutes from Times Square and Central Park.",
  },
  {
    slug: "433-west-53",
    name: "433 West 53rd Street",
    neighborhood: "Hell's Kitchen",
    image: "/images/properties/433-west-53.jpg",
    blurb:
      "A newer elevator building with floor-to-ceiling windows.",
  },
  {
    slug: "626-10th-ave",
    name: "626 10th Avenue",
    neighborhood: "Hell's Kitchen",
    image: "/images/properties/626-10th-ave.jpg",
    blurb:
      "A six-story mid-rise in the heart of the Theater District and Restaurant Row.",
  },
  {
    slug: "145-mulberry",
    name: "145 Mulberry Street",
    neighborhood: "Little Italy",
    image: "/images/properties/145-mulberry.jpg",
    blurb:
      "Recently renovated residences bordering Tribeca, NoHo, and SoHo.",
  },
  {
    slug: "165-east-89",
    name: "165 East 89th Street",
    neighborhood: "Upper East Side",
    image: "/images/properties/165-east-89.png",
    blurb:
      "Steps from Central Park and Museum Mile on the classic Upper East Side.",
  },
  {
    slug: "407-west-51",
    name: "407 West 51st Street",
    neighborhood: "Hell's Kitchen",
    image: "/images/properties/407-west-51.jpg",
    blurb:
      "Close to Broadway theaters and Restaurant Row in Hell's Kitchen.",
  },
  {
    slug: "45-west-81",
    name: "45 West 81st Street",
    neighborhood: "Upper West Side",
    image: "/images/properties/45-west-81.jpg",
    blurb:
      "A gut-renovated historic building on one of the Upper West Side's most iconic blocks.",
  },
];
