import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const stack = [
  "Next.js 16 (App Router)",
  "React 19 + TypeScript",
  "ShadCN UI + Tailwind v4",
  "TanStack Query",
  "Prisma 7 + PostgreSQL",
  "Zod",
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 p-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Property Link</h1>
        <p className="text-muted-foreground">
          Starter scaffold wiring the modern stack together end to end.
        </p>
      </div>

      <ul className="grid gap-2 text-sm sm:grid-cols-2">
        {stack.map((item) => (
          <li key={item} className="rounded-md border bg-card px-3 py-2">
            {item}
          </li>
        ))}
      </ul>

      <div>
        <Link href="/items" className={buttonVariants()}>
          View the demo feature →
        </Link>
      </div>
    </main>
  );
}
