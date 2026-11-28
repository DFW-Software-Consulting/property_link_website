import { NextResponse } from "next/server";

import {
  RESIDENT_SESSION_COOKIE,
  ResidentPortalApiError,
  verifyPortalToken,
} from "@/lib/resident-portal/client";
import { portalVerifySchema } from "@/lib/resident-portal/schema";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = portalVerifySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid verification token" },
      { status: 400 },
    );
  }

  try {
    const verified = await verifyPortalToken(parsed.data.token);
    const response = NextResponse.json({
      data: { email: verified.email, expiresAt: verified.expiresAt },
    });
    response.cookies.set(RESIDENT_SESSION_COOKIE, verified.sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 24 * 60 * 60,
    });
    return response;
  } catch (error) {
    if (error instanceof ResidentPortalApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Unable to verify portal token" }, { status: 502 });
  }
}
