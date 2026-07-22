<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PropertyLink marketing site — agent guide

Public marketing site for PropertyLink (propertylinknyc.com). Next.js 15 App
Router + TypeScript + Tailwind. Small repo — read this whole file.

## Layout

- `src/app/(marketing)/` — public pages (residences, residents/maintenance, short-term stays)
- `src/components/` — feature components; `src/components/ui/` — shadcn-style primitives
- `src/emails/` — React Email templates (maintenance confirmations)
- `src/lib/` — schemas (zod), data helpers
- `src/app/api/` — thin routes; maintenance intake POSTs to the management app

## UI primitives — read before touching `src/components/ui/`

- The shadcn style here is **`base-nova` (Base UI)** — NOT Radix, no cmdk, no
  Popover primitive. Check `components.json` before assuming a primitive exists.
- **Never run `npx shadcn add`** — it silently overwrites customized primitives
  (`button.tsx` has repo-specific `brand`/`xl` variants). To bring in a new
  registry component, fetch its source read-only with `npx shadcn view <name>`
  and hand-adapt it (precedent: `combobox.tsx`, `input-group.tsx`).
- Comboboxes: Base UI's `Combobox` (see the maintenance form). Its change
  callbacks receive `eventDetails` with a `reason` + `cancel()` — use the
  helpers in `maintenance-form.tsx` (`cancelIfEscapeKey`,
  `isDirectComboboxTextEdit`) as the pattern for keeping RHF state in sync
  with visible text.

## Data contracts

- Building/company/gallery content comes from the management app's public CMS
  API (`/api/public/cms/*` on emmut) — those DTOs are owned there; do not
  invent fields here.
- The maintenance form POSTs to the management app's public intake. Do not
  rename form fields or severity/priority values without coordinating with
  the emmut repo (`MaintenanceIntake` consumer).
- The building/unit dropdowns are inventory-fed with a free-text fallback when
  the inventory endpoint is unavailable — keep both branches working.

## Copy rules

- Life-safety guidance: fire / gas leak / smoke / CO → **call 911 first**; the
  office and the work-order flow are for urgent-but-not-life-threatening
  issues. This wording is deliberate (deck#473) — keep the 911 callout before
  the form in mobile source order.
- Say "urgent"/"non-urgent", not "emergency", in resident-facing maintenance
  copy. (`"emergencies excepted"` in the permission-to-enter label is a
  distinct legal concept — leave it.)

## Testing & tooling

- `npm run typecheck && npm run lint && npm run test` is the full local gate.
- Vitest runs in **node environment — there is no jsdom/RTL component-render
  infra**. Test pure helpers; don't bootstrap component rendering for one test.
- There is **no prettier config**; the editor/agent auto-format hook may
  rewrite untouched lines (e.g. semicolon-free files under `src/components/ui/`).
  If that happens, rebuild the file from the git blob so diffs stay surgical.
- Deploys: Vercel previews per PR; production from `main`.

## Git

- Conventional commits explaining why. Branches `deck/<id>-<slug>` for ticket
  work. Never commit to `main` directly. No AI attribution anywhere.
