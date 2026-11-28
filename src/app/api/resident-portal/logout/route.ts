import { NextResponse } from "next/server";

import { RESIDENT_SESSION_COOKIE } from "@/lib/resident-portal/client";

export async function POST() {
  const response = NextResponse.json({ data: { signedOut: true } });
  response.cookies.set(RESIDENT_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
