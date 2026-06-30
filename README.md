# Property Link

Web app for Property Link, built on a modern full-stack TypeScript setup.

## Stack

| Concern        | Choice                                    |
| -------------- | ----------------------------------------- |
| Framework      | Next.js 16 (App Router)                   |
| UI             | React 19, ShadCN UI, Tailwind CSS v4      |
| Language       | TypeScript (strict)                       |
| Server state   | TanStack Query                            |
| Forms          | react-hook-form + Zod                     |
| Validation     | Zod (shared client/server schemas)        |
| ORM / Database | Prisma 7 (pg driver adapter) + PostgreSQL |

## Getting started

### Prerequisites

- Node.js 20+
- Docker (for the local PostgreSQL database)

### Setup

```bash
# 1. Install dependencies (also generates the Prisma client)
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start PostgreSQL (host port 5434 -> container 5432)
docker compose up -d

# 4. Create the database schema
npm run db:push

# 5. (Optional) Seed sample data
npm run db:seed

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then visit `/items` for a
demo feature that exercises the whole stack: a Prisma-backed API route, data
fetched with TanStack Query, and a react-hook-form + Zod form validated by the
same schema on the client and the server.

## Scripts

| Script                | Description                            |
| --------------------- | -------------------------------------- |
| `npm run dev`         | Start the dev server                   |
| `npm run build`       | Production build                       |
| `npm run start`       | Run the production build               |
| `npm run lint`        | Lint with ESLint                       |
| `npm run db:push`     | Sync the Prisma schema to the database |
| `npm run db:migrate`  | Create and apply a migration           |
| `npm run db:seed`     | Seed sample data                       |
| `npm run db:studio`   | Open Prisma Studio                     |
| `npm run db:generate` | Regenerate the Prisma client           |

## Long-Term Rentals CMS

The `/long-term-rentals` pages (listing + per-building detail) are driven by the
**Emmut public CMS API** — the property-management app is the source of truth for
buildings, layouts, and photos. This site only reads from it.

- **Origin**: `CMS_API_URL` (see `.env.example`). Unset/empty falls back to
  production (`https://emmut.dfwsc.com`); the single fallback constant lives in
  [`src/lib/cms/constants.ts`](src/lib/cms/constants.ts) and is shared by
  `src/lib/env.ts` and `next.config.ts`.
- **Endpoints consumed** (all public, no auth): `GET /api/public/cms/buildings`,
  `GET /api/public/cms/buildings/{slug}`, and `GET /api/public/cms/images/{id}`
  (`?variant=thumb` for the 800px webp). Image hosts are allow-listed in
  `next.config.ts`.
- **Client**: [`src/lib/cms/client.ts`](src/lib/cms/client.ts) (server-only).
  Responses are Zod-validated (`src/lib/cms/schema.ts`); the helpers **never
  throw** — on outage or a bad shape they log (structured, `scope: "cms"`) and
  return `[]` / `null`, so pages render a graceful empty state instead of erroring.
- **Caching**: ISR with a 60s revalidate window. For instant updates, the CMS can
  POST `/api/revalidate` with the `x-revalidate-secret` header
  (`CMS_REVALIDATE_SECRET`); when that secret is unset the route returns 503.
- **Health**: `GET /api/health` probes CMS reachability — 200 when reachable,
  503 when not — so a silent CMS outage is alertable.

## Project structure

```
prisma/
  schema.prisma        # Item demo model
  seed.ts              # Sample data
src/
  app/
    api/items/route.ts # GET/POST items (Prisma + Zod)
    items/page.tsx     # Demo feature page
    layout.tsx         # Wraps the app in Providers + Toaster
    page.tsx           # Home
  components/
    items/             # ItemList + CreateItemForm
    providers.tsx      # TanStack Query provider
    ui/                # ShadCN components
  lib/
    db.ts              # Prisma client singleton (pg adapter)
    env.ts             # Zod-validated environment
    get-query-client.ts
    schemas/item.ts    # Shared Zod schema
```

The `Item` model is a generic placeholder that proves the stack works
end to end — replace it with the real property domain models.
