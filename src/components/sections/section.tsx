import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sectionVariants = cva("w-full", {
  variants: {
    tone: {
      default: "bg-background text-foreground",
      muted: "bg-secondary/60 text-foreground",
      primary: "bg-primary text-primary-foreground",
    },
    spacing: {
      default: "py-16 sm:py-20 lg:py-24",
      sm: "py-12 sm:py-16",
      none: "",
    },
  },
  defaultVariants: {
    tone: "default",
    spacing: "default",
  },
});

type SectionProps = React.ComponentProps<"section"> &
  VariantProps<typeof sectionVariants>;

/** Full-bleed page section with consistent vertical rhythm and tonal bands. */
export function Section({ className, tone, spacing, ...props }: SectionProps) {
  return (
    <section
      className={cn(sectionVariants({ tone, spacing }), className)}
      {...props}
    />
  );
}
