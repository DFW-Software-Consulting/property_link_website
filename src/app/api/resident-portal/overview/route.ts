import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  fetchPortalOverview,
  RESIDENT_SESSION_COOKIE,
  ResidentPortalApiError,
} from "@/lib/resident-portal/client";

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(RESIDENT_SESSION_COOKIE)?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    const overview = await fetchPortalOverview(sessionToken);
    return NextResponse.json({ data: overview });
  } catch (error) {
    if (error instanceof ResidentPortalApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Unable to load resident portal" }, { status: 502 });
  }
}
