# Dev, test, CI and deploy

## Commands
- `npm run dev` (Node 20+; CI uses Node 20), `npm run build`, `npm run start`.
- Full local gate: `npm run typecheck && npm run lint && npm run test`. `npm run test:coverage` is what CI runs.
- `npm run fallow` / `fallow:audit`: dead-code analysis, config in `.fallowrc.jsonc`.
- `make help` lists Makefile targets; the `db-*` ones are stale (no database in this app, see [site-architecture.md](site-architecture.md)).
- No env vars are required to start the dev server; `CMS_API_URL` defaults to the production CMS, so set it for a local CMS. Names are in `.env.example`.

## Tests
- Vitest in the `node` environment (`vitest.config.ts`); there is no jsdom or component-render setup. Test pure helpers and route handlers.
- Coverage measures only `src/lib/**` and `src/app/api/**`, with thresholds statements 92, branches 85, functions 90, lines 92. Static data and type-only modules are excluded. These are a ratchet; raise them as coverage improves, never lower to make CI pass.
- `server-only` is aliased to a no-op module so server code can be unit tested.

## Hooks
Husky: pre-commit runs `lint-staged` (`eslint --fix` on staged JS/TS); commit-msg runs commitlint (`.commitlintrc.json`, Conventional Commits). Hooks activate after `npm install` (the `prepare` script). There is no Prettier config: an editor auto-format hook can rewrite untouched lines (notably in `src/components/ui/`); if that happens, rebuild the file from the git blob to keep diffs small.

## CI (`.github/workflows/`)
- `ci.yml` on push to `main` and every PR: `npm ci`, lint, typecheck, `test:coverage`, `build`.
- `security.yml` nightly and on demand: gitleaks secret scan and a dependency audit gate. The repo is public, so keep secrets and internal details out of commits and PR text.
- `dependabot.yml` opens dependency PRs; most recent history is Dependabot bumps plus copy fixes.

## Deploy
Deployed by the hosting platform: a preview per pull request and production from `main`. Environment variables are set on the platform; an empty `CMS_API_URL` is treated as unset on purpose (a common platform footgun). Production must set `TURNSTILE_SECRET_KEY`, `CMS_REVALIDATE_SECRET` (and have the CMS send the same value), `MAINTENANCE_INTAKE_SHARED_SECRET` and the SMTP/inbox variables, or the matching features return 503 or skip checks.
