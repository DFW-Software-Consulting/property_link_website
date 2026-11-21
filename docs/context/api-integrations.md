# API routes and integrations

All routes are Next route handlers under `src/app/api/`, each with a `route.test.ts`. Env var names come from `src/lib/env.ts` (Zod-parsed) and `.env.example`.

## Routes
- `contact` (POST): contact/availability form. Honeypot returns a silent 200, in-memory rate limit returns 429, mailer unconfigured returns 503, render or send failure returns 502, 201 only after real delivery. There is no database or queue, so email is the delivery mechanism and success must mean delivered.
- `maintenance` (POST): resident maintenance request with photos. Verifies a Cloudflare Turnstile token (`src/lib/maintenance/captcha.ts`; skipped when `TURNSTILE_SECRET_KEY` is unset, so production must set it), rate limits 5 per 10 minutes per IP in memory, then tries a direct multipart POST to the management app's public maintenance endpoint. If that fails it falls back to a signed email so a submission is not dropped.
- `rental-application` (POST): USA rental application intake; 503 when its inbox or from-address is not configured.
- `application-inquiry` (POST): international application inquiry email.
- `revalidate` (POST): on-demand ISR refresh. Needs header `x-revalidate-secret` equal to `CMS_REVALIDATE_SECRET` (timing-safe compare); 503 when the secret is unset, 401 when wrong.
- `health` (GET): probes CMS reachability; 200 reachable, 503 not, so an outage is alertable.

## CMS client (`src/lib/cms/`)
- Base origin from `CMS_API_URL`; unset or empty falls back to a constant in `src/lib/cms/constants.ts` (shared with `next.config.ts`, which also allow-lists image hosts).
- Endpoints read: buildings, building by slug, company info, trusted companies, reviews, plus image URLs. Responses are Zod-validated (`schema.ts`).
- Helpers never throw: on outage or bad shape they log with `scope: "cms"` and return `[]` or `null` so pages show an empty state.
- ISR window is `CMS_REVALIDATE_SECONDS` in `client.ts` (60 s); the CMS can force a refresh through `/api/revalidate`.

## Maintenance signing contract (do not change casually)
`src/lib/maintenance/signature.ts` canonicalizes the payload (keys sorted recursively, `signature` and undefined omitted) and signs it with HMAC-SHA256 using `MAINTENANCE_INTAKE_SHARED_SECRET`. It must stay byte-identical to the verifier in the management app; a mismatch silently rejects requests. Form field names and severity/priority values are also a cross-repo contract. `npm run test:maintenance` (`scripts/test-maintenance-signature.ts`) checks the contract and can optionally send one real email, so do not run it with live SMTP values set unless you mean to.

## Email
`src/lib/email/mailer.ts` (Nodemailer, SMTP via `SMTP_*`). Required variable sets are checked at send time, not at boot, so builds pass without SMTP. Variables: `SMTP_HOST/PORT/USER/PASS`, `CONTACT_TO`, `CONTACT_FROM`, `MAINTENANCE_MAILBOX`, `FORM_FROM_ADDRESS`, `RENTAL_APPLICATION_TO`, `FROM_ADDRESS`. `src/lib/email/__tests__/mailer.smoke.test.ts` exercises real SMTP transport against a local TCP stub, so it needs no credentials.

## Gotchas
- Rate limiters are per-instance, in memory, and reset on restart.
- Inventory-fed building/unit dropdowns in the maintenance form need a free-text fallback when the endpoint is down; keep both paths working.
