/**
 * Empty stub used by `vitest.config.ts` to alias `server-only`.
 *
 * The real `server-only` package throws unless it's resolved via React's
 * `react-server` export condition (which only exists in the Next.js RSC
 * bundler). Under Vitest's plain Node environment it resolves to the throwing
 * build, so we alias it to this no-op for tests. Not a test file itself.
 */
export {};
