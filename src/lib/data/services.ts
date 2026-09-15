import { Building2, CalendarClock, KeyRound, type LucideIcon } from "lucide-react";

export type Service = {
  /** Anchor id so footer sub-links (e.g. /services#short-term) work. */
  id: string;
  icon: LucideIcon;
  title: string;
  tagline: string;
  description: string;
  features: string[];
};

export const services: Service[] = [
  {
    id: "short-term",
    icon: CalendarClock,
    title: "Short-Term Furnished Stays",
    tagline: "Fully furnished homes for stays of 30 days or more.",
    description:
      "A furnished apartment for a month or longer, as an alternative to an extended hotel stay.",
    features: [
      "Move-in ready with furniture, linens, and a full kitchen",
      "Utilities and Wi-Fi are set up for you",
      "Flexible move-in and move-out dates",
      "Ideal for relocations, medical stays, and time between homes",
    ],
  },
  {
    id: "long-term",
    icon: KeyRound,
    title: "Residences",
    tagline:
      "Settle into a 12-month lease in a building owned and managed by one team.",
    description:
      "A 12-month lease with the building's owner as your landlord and manager.",
    features: [
      "Furnished and unfurnished options",
      "Maintenance requests handled by our own team",
      "Pets welcome, subject to building policy",
      "Buildings in five Manhattan neighborhoods",
    ],
  },
  {
    id: "corporate",
    icon: Building2,
    title: "Corporate & Relocation Housing",
    tagline: "Furnished housing for teams, productions, and relocations.",
    description:
      "Housing for companies and productions bringing staff to Manhattan.",
    features: [
      "One point of contact for HR and relocation teams",
      "Flexible lease terms and consolidated billing",
      "Multiple furnished units across Manhattan",
      "Experience with corporate and entertainment clients",
    ],
  },
];
