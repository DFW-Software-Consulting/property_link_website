import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

/** Constant-time string compare (length mismatch fails fast, leaking only length). */
function secretMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * On-demand revalidation webhook. The CMS pings this on publish/unpublish so
 * changes appear immediately instead of waiting for the time-based ISR window.
 *
 * Auth: `x-revalidate-secret` header must match CMS_REVALIDATE_SECRET.
 * Body (optional): { "slug": "138-bowery" } — revalidates the listing, sitemap,
 * and that building's page. With no slug, revalidates every building page too.
 */
export async function POST(request: Request) {
  const secret = env.CMS_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Revalidation is not configured." },
      { status: 503 },
    );
  }

  const provided = request.headers.get("x-revalidate-secret") ?? "";
  if (!secretMatches(provided, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    slug?: unknown;
  } | null;
  const slug =
    typeof body?.slug === "string" && body.slug.trim() !== ""
      ? body.slug.trim()
      : undefined;

  // The listing + sitemap always change when published inventory changes.
  const revalidated: string[] = ["/residences", "/sitemap.xml"];
  revalidatePath("/residences");
  revalidatePath("/sitemap.xml");

  if (slug) {
    const path = `/residences/${slug}`;
    revalidatePath(path);
    revalidated.push(path);
  } else {
    // No specific building — refresh every building detail page.
    revalidatePath("/residences/[slug]", "page");
    revalidated.push("/residences/[slug]");
  }

  return NextResponse.json({ revalidated });
}
