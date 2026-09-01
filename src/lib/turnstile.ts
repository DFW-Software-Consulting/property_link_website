/**
 * Cloudflare Turnstile site key, read client-side. `NEXT_PUBLIC_*` vars are
 * inlined at build time by Next.js, so this must stay a plain, literal
 * `process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY` reference. The matching secret
 * key is verified server-side — see `src/lib/env.ts` (`TURNSTILE_SECRET_KEY`).
 */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
