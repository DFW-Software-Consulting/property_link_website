import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ResidentPortalClient } from "@/components/resident-portal/resident-portal-client";
import { checkResidentPortalEnabled } from "@/lib/resident-portal/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resident Portal",
  description: "Access your stay details, Wi-Fi and entry codes, invoices, maintenance updates, and lease renewals.",
};

export default async function ResidentPortalPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const enabled = await checkResidentPortalEnabled();
  if (!enabled) {
    notFound();
  }

  const params = await searchParams;
  return (
    <main className="mx-auto min-h-[70vh] max-w-5xl px-4 py-12">
      <ResidentPortalClient initialToken={params.token} />
    </main>
  );
}
