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
    description: "Connected and work-ready from the moment you arrive.",
  },
  {
    icon: Flame,
    label: "Heat & hot water",
    description: "In place in every unit — electricity billed separately.",
  },
  {
    icon: Snowflake,
    label: "Air conditioning",
    description: "Comfortable in every season.",
  },
  {
    icon: BedDouble,
    label: "Fresh linens",
    description: "Beds made and towels stocked for move-in day.",
  },
  {
    icon: ChefHat,
    label: "Full kitchen",
    description: "Cook at home with a fully equipped kitchen.",
  },
  {
    icon: PawPrint,
    label: "Pet-friendly",
    description: "Bring the whole household — pets are welcome.",
  },
];
