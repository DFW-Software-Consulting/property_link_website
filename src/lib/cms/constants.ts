/**
 * CMS constants with no runtime dependencies.
 *
 * Deliberately dependency-free (no `zod`, no `env`, no `server-only`) so it can
 * be imported from BOTH `src/lib/env.ts` and the root `next.config.ts` — the
 * latter runs before the `@/` path alias exists and can't pull in server-only
 * modules. Keep it that way.
 */

/**
 * Default origin of the Emmut public CMS API, used when `CMS_API_URL` is unset
 * or empty. Single source of truth for the fallback so `env.ts` (runtime) and
 * `next.config.ts` (image `remotePatterns`) can never drift apart.
 */
export const CMS_API_FALLBACK_ORIGIN = "https://emmut.dfwsc.com";
