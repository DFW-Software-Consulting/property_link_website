/**
 * Tiny structured logger for the CMS integration.
 *
 * Emits one JSON object per line (`scope: "cms"`) so CMS outages, timeouts, and
 * shape-validation failures show up as queryable fields in Vercel/host log
 * drains instead of free-text `console.error` strings. No dependencies — safe to
 * import anywhere on the server.
 */

type CmsLogLevel = "info" | "warn" | "error";

/** Context fields are flat and JSON-serializable (ids, paths, status codes). */
type LogContext = Record<string, string | number | boolean | null | undefined>;

function normalizeError(error: unknown): { error: string; errorName?: string } {
  if (error instanceof Error) {
    return { error: error.message, errorName: error.name };
  }
  return { error: typeof error === "string" ? error : "unknown error" };
}

function emit(level: CmsLogLevel, message: string, context?: LogContext): void {
  const entry = {
    scope: "cms" as const,
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context ?? {}),
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export const cmsLogger = {
  info: (message: string, context?: LogContext) => emit("info", message, context),
  warn: (message: string, context?: LogContext) => emit("warn", message, context),
  /** Logs an error with a normalized `error`/`errorName` plus any extra context. */
  error: (message: string, error?: unknown, context?: LogContext) =>
    emit("error", message, {
      ...context,
      ...(error !== undefined ? normalizeError(error) : {}),
    }),
};
