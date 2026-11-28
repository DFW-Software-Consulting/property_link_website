import { NextResponse } from "next/server";

import {
  checkConciergeEnabled,
  ConciergeApiError,
  sendConciergeMessage,
} from "@/lib/concierge/client";
import { conciergeRequestSchema } from "@/lib/concierge/schema";

export async function GET() {
  const enabled = await checkConciergeEnabled();
  if (!enabled) {
    return NextResponse.json({ error: "Leasing concierge is not enabled" }, { status: 404 });
  }
  return NextResponse.json({ data: { enabled: true } });
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = conciergeRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid concierge message" },
      { status: 400 },
    );
  }

  try {
    const reply = await sendConciergeMessage(parsed.data);
    return NextResponse.json({ data: reply });
  } catch (error) {
    if (error instanceof ConciergeApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Unable to reach leasing concierge" }, { status: 502 });
  }
}
