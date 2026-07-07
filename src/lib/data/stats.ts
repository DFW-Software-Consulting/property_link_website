export type Stat = {
  value: string;
  label: string;
};

/** Trust signals shown in the TrustBar across pages. */
export const stats: Stat[] = [
  { value: "2015", label: "Owner-operated since" },
  { value: "10", label: "Buildings we own & manage" },
  { value: "4", label: "Manhattan neighborhoods" },
  { value: "1 day", label: "Typical response time" },
];
