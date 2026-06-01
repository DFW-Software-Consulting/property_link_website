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
