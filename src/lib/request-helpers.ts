/**
 * Small, shared helpers for the public form-intake API routes (contact,
 * application-inquiry, maintenance, rental-application).
 */
import "server-only";

/** Best-effort client IP from a fronting proxy's `x-forwarded-for` header. */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

/**
 * Bots fill the hidden `website` field. Callers pretend success and drop the
 * submission when this returns true.
 */
export function isHoneypotFilled(value: string | undefined): boolean {
  return Boolean(value && value.trim() !== "");
}

/** Returns a `getField(key)` reader over a parsed `FormData`, string fields only. */
export function createFormFieldGetter(form: FormData): (key: string) => string {
  return (key: string): string => {
    const value = form.get(key);
    return typeof value === "string" ? value : "";
  };
}
