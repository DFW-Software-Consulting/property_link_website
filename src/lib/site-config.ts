/**
 * Single source of truth for company NAP (name/address/phone), navigation, and
 * footer structure. Reused by the header, footer, contact page, metadata, and
 * JSON-LD so there is exactly one place to update business details.
 */

export type NavItem = {
  label: string;
  href: string;
  /** Future/secondary pages not yet built — hidden from primary nav for now. */
  upcoming?: boolean;
};

export type FooterLinkGroup = {
  title: string;
  links: { label: string; href: string }[];
};

/**
 * Resolved public contact details. Sourced from the CMS when available (see
 * `getSiteContactInfo`), otherwise the static `siteConfig` values below.
 */
export type SiteContactInfo = {
  phone: { display: string; href: string };
  email: string;
};

export const siteConfig = {
  name: "PropertyLink Management NYC",
  shortName: "PropertyLink NYC",
  url: "https://www.propertylinknyc.com",
  description:
    "PropertyLink NYC offers move-in-ready furnished apartments for stays of 30 days or more and 12-month leases across Manhattan. We own and manage every building we rent — from Little Italy to the Upper East Side.",
  tagline: "New York City's premier furnished housing provider.",
  foundedYear: 2015,
  phone: {
    display: "888-622-0772",
    href: "tel:+18886220772",
  },
  email: "info@propertylinknyc.com",
  address: {
    line1: "521 West 48th Street, Suite 1A",
    city: "New York",
    state: "NY",
    zip: "10036",
    full: "521 West 48th Street, Suite 1A, New York, NY 10036",
  },
  hours: [
    { days: "Monday – Friday", time: "9:00 AM – 6:00 PM EST" },
    { days: "Saturday – Sunday", time: "Closed" },
  ],
  social: {
    instagram: "https://www.instagram.com/propertylinknyc/",
    facebook: "https://www.facebook.com/Propertylinknyc/",
  },
} as const;

/** Primary navigation. `upcoming` items are reserved for later phases. */
export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Residences", href: "/residences" },
  { label: "Apply", href: "/residents/application" },
  { label: "Work Order", href: "/residents/maintenance" },
  { label: "Contact", href: "/contact" },
];

/** Items actually shown in the header nav (upcoming pages hidden for now). */
export const primaryNavItems: NavItem[] = navItems.filter(
  (item) => !item.upcoming,
);

export const footerGroups: FooterLinkGroup[] = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Short-Term Furnished Stays", href: "/short-term-stays" },
      { label: "Residences", href: "/residences" },
      { label: "Corporate & Relocation", href: "/services#corporate" },
    ],
  },
];
