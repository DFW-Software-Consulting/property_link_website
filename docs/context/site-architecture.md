# Site architecture and layout

Public marketing site for a NYC furnished-housing company. Next.js App Router, React 19, TypeScript (strict), Tailwind v4, no database. Agent rules are in [AGENTS.md](../../AGENTS.md) (CLAUDE.md just imports it); page/content planning is in [docs/SITE-PLAN.md](../SITE-PLAN.md). Read AGENTS.md too: it has the UI primitive and copy rules this file does not repeat.

## Doc drift to know about
- `README.md` still describes an earlier scaffold (Prisma, `/items` demo, `db:*` scripts). None of that exists in the repo now: no `prisma/` folder, no Prisma dependency in `package.json`. The `db-*` targets in `Makefile` and `docker-compose.yml` (a local Postgres) are leftovers and the app does not use a database.
- `AGENTS.md` says Next.js 15; `package.json` pins Next 16.3.x. Trust `package.json`. `AGENTS.md` warns that this Next version differs from older knowledge: read `node_modules/next/dist/docs/` before relying on memory.

## Layout
- `src/app/(marketing)/`: public pages (`/`, `about`, `contact`, `services`, `residences` and `residences/[slug]`, `short-term-stays`, `residents/maintenance`, `residents/application` with `usa` and `international` subpages). One shared layout with header and footer.
- `src/app/api/`: `contact`, `maintenance`, `rental-application`, `application-inquiry`, `revalidate`, `health`. Each has a co-located `route.test.ts`. Detail in [api-integrations.md](api-integrations.md).
- `src/app/sitemap.ts`, `robots.ts`, `src/lib/seo/json-ld.tsx`: SEO.
- `src/components/`: `marketing/` (cards, hero, marquees, filters), `layout/`, `contact/`, `maintenance/`, `application/`, `sections/`, and `ui/` (shadcn-style primitives on Base UI, hand-adapted; see AGENTS.md before touching).
- `src/emails/`: React Email templates (contact notification, international application inquiry, maintenance request).
- `src/lib/`: `cms/` (CMS client, Zod schemas, filters), `schemas/` (form Zod schemas), `maintenance/` (payload, HMAC signature, CAPTCHA), `email/mailer.ts`, `env.ts`, `site-config.ts` (single source for name, phone, address, hours, social), `data/` (static fallback content).

## Data flow
Building, unit, company info, reviews and trusted-company content comes from an external property-management CMS API and is fetched server-side with ISR (`src/lib/cms/client.ts`). Static copies in `src/lib/data/` are fallbacks shown only when the CMS is empty or unreachable; keep them matching the live building list (a past fix, see [errors.md](errors.md)). The CMS owns the DTO shapes: do not invent fields.

## Conventions
- Conventional commits; ticket branches `deck/<id>-<slug>`; never commit to `main`.
- Copy changes are frequent and come from client feedback tickets. Life-safety wording on maintenance pages is deliberate (call 911 first; say "urgent", not "emergency").
- Server-only modules (`cms/client.ts`, `env.ts`, signature code) must not be imported from Client Components.
