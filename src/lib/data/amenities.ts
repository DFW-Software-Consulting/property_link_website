import {
  BedDouble,
  ChefHat,
  Flame,
  type LucideIcon,
  PawPrint,
  Snowflake,
  Wifi,
} from "lucide-react";

export type Amenity = {
  icon: LucideIcon;
  label: string;
  description: string;
};

/** What's included in every furnished PropertyLink unit. */
export const amenities: Amenity[] = [
  {
    icon: Wifi,
    label: "High-speed Wi-Fi",
    description: "Set up before you move in.",
  },
  {
    icon: Flame,
    label: "Heat & hot water",
    description: "In place in every unit; electricity is billed separately.",
  },
  {
    icon: Snowflake,
    label: "Air conditioning",
    description: "In place in every unit; runs on electricity, billed separately.",
  },
  {
    icon: BedDouble,
    label: "Fresh linens",
    description: "Bed linens and towels provided.",
  },
  {
    icon: ChefHat,
    label: "Full kitchen",
    description: "Cook at home with a fully equipped kitchen.",
  },
  {
    icon: PawPrint,
    label: "Pets welcome",
    description: "Subject to building policy and application approval.",
  },
];
