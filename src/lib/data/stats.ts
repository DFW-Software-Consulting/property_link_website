export type Stat = {
  value: string;
  label: string;
};

/** Trust signals shown in the TrustBar across pages. */
export const stats: Stat[] = [
  { value: "1998", label: "Owner-operated since" },
  { value: "10", label: "Buildings we own & manage" },
  { value: "5", label: "Manhattan neighborhoods" },
  { value: "Decades of", label: "combined team experience" },
];
