import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  requestLeaseRenewal,
  RESIDENT_SESSION_COOKIE,
  ResidentPortalApiError,
} from "@/lib/resident-portal/client";
import { portalRenewalRequestSchema } from "@/lib/resident-portal/schema";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(RESIDENT_SESSION_COOKIE)?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = portalRenewalRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid renewal request" },
      { status: 400 },
    );
  }

  try {
    const created = await requestLeaseRenewal(sessionToken, parsed.data);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof ResidentPortalApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Unable to submit renewal request" }, { status: 502 });
  }
}
