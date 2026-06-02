import { Container } from "@/components/layout/container";
import { Stat } from "@/components/marketing/stat";
import { stats } from "@/lib/data/stats";

export function TrustBar() {
  return (
    <div className="border-y border-border bg-secondary/40">
      <Container className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-4">
        {stats.map((stat) => (
          <Stat key={stat.label} {...stat} />
        ))}
      </Container>
    </div>
  );
}
