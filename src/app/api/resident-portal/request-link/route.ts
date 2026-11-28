import { NextResponse } from "next/server";

import { requestPortalMagicLink, ResidentPortalApiError } from "@/lib/resident-portal/client";
import { portalRequestLinkSchema } from "@/lib/resident-portal/schema";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = portalRequestLinkSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid email address" },
      { status: 400 },
    );
  }

  try {
    const result = await requestPortalMagicLink(parsed.data.email);
    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof ResidentPortalApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Unable to request portal link" }, { status: 502 });
  }
}
