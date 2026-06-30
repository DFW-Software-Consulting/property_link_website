import { NextResponse } from "next/server";
import { checkCmsHealth } from "@/lib/cms/client";

// Never cache a health check — every hit must reflect live state.
export const dynamic = "force-dynamic";

/**
 * Liveness/readiness probe. Returns 200 when the CMS is reachable, 503 when it
 * is not, so uptime monitors turn a silent CMS outage (the listing quietly
 * showing "no listings") into an alertable signal.
 */
export async function GET() {
  const cms = await checkCmsHealth();
  return NextResponse.json(
    {
      status: cms.ok ? "ok" : "degraded",
      cms,
      timestamp: new Date().toISOString(),
    },
    { status: cms.ok ? 200 : 503 },
  );
}
