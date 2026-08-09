import crypto from "node:crypto";

/**
 * Maintenance-request signing contract.
 *
 * This MUST stay byte-for-byte identical to the verification side in the
 * property-management ingest app — a mismatch silently rejects the request.
 * The canonicalization below is the agreed contract: object keys sorted
 * recursively, the `signature` key and `undefined` values omitted, arrays
 * kept in order. Do not "improve" it.
 *
 * Server-only (uses `node:crypto`). Do not import from Client Components.
 */

export function canonicalize(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(canonicalize).join(",") + "]";
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return (
      "{" +
      Object.keys(obj)
        .filter((k) => k !== "signature" && obj[k] !== undefined)
        .sort()
        .map((k) => JSON.stringify(k) + ":" + canonicalize(obj[k]))
        .join(",") +
      "}"
    );
  }
  return JSON.stringify(value); // string | number | boolean | null
}

/** Hex HMAC-SHA256 over the canonical serialization of the payload. */
export function sign(payloadWithoutSignature: unknown, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(canonicalize(payloadWithoutSignature))
    .digest("hex");
}

/**
 * Constant-time verification. The canonicalizer already drops the `signature`
 * key, so passing the full signed payload is safe.
 */
export function verify(
  payload: unknown,
  signature: string,
  secret: string,
): boolean {
  if (typeof signature !== "string" || signature.length === 0) return false;
  const expected = sign(payload, secret);
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  if (a.length === 0 || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
