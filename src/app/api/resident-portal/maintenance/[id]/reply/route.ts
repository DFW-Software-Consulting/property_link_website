import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  replyMaintenanceThread,
  RESIDENT_SESSION_COOKIE,
  ResidentPortalApiError,
} from "@/lib/resident-portal/client";
import { portalMaintenanceReplySchema } from "@/lib/resident-portal/schema";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(RESIDENT_SESSION_COOKIE)?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await context.params;
  const requestId = Number.parseInt(id, 10);
  if (!Number.isInteger(requestId) || requestId <= 0) {
    return NextResponse.json({ error: "Invalid maintenance request ID" }, { status: 400 });
  }

  const json = await request.json().catch(() => null);
  const parsed = portalMaintenanceReplySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid reply" },
      { status: 400 },
    );
  }

  try {
    const created = await replyMaintenanceThread(sessionToken, requestId, parsed.data.body);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof ResidentPortalApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Unable to send reply" }, { status: 502 });
  }
}
