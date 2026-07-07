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
      "A cost-effective, far more comfortable alternative to an extended hotel stay. Move in with nothing but a suitcase — everything else is already here.",
    features: [
      "Move-in ready with furniture, linens, and a full kitchen",
      "All utilities, Wi-Fi, and air conditioning included",
      "Flexible move-in and move-out dates",
      "Ideal for relocations, medical stays, and time between homes",
    ],
  },
  {
    id: "long-term",
    icon: KeyRound,
    title: "Residences",
    tagline: "Settle into a building owned and managed by one team.",
    description:
      "Make Manhattan home with the convenience of an owner-operated building and a management team that actually answers the phone.",
    features: [
      "Furnished and unfurnished options",
      "Responsive, accountable on-site management",
      "Pet-friendly buildings",
      "Prime, transit-rich neighborhoods",
    ],
  },
  {
    id: "corporate",
    icon: Building2,
    title: "Corporate & Relocation Housing",
    tagline: "Turnkey housing for teams, productions, and relocations.",
    description:
      "Trusted by leading companies and productions to house their people in Manhattan, with a single point of contact and terms built for business.",
    features: [
      "One point of contact for HR and relocation teams",
      "Flexible lease terms and consolidated billing",
      "Multiple furnished units across Manhattan",
      "Proven with corporate and entertainment clients",
    ],
  },
];
