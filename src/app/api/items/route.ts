import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createItemSchema } from "@/lib/schemas/item";

export async function GET() {
  const items = await db.item.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = createItemSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const description = parsed.data.description?.trim();
  const item = await db.item.create({
    data: {
      name: parsed.data.name.trim(),
      description: description ? description : null,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
