import { describe, expect, it } from "vitest";

import { canonicalize, sign, verify } from "../signature";

const secret = "test-shared-secret";
const payload = {
  building: "Maple Court",
  contact: { firstName: "Ana", email: "ana@example.com" },
  photos: [{ filename: "leak.jpg", contentType: "image/jpeg" }],
};

describe("maintenance signatures", () => {
  it("signs canonical payloads as a hex HMAC that verifies with the shared secret", () => {
    const signature = sign(payload, secret);

    expect(signature).toMatch(/^[a-f0-9]{64}$/);
    expect(verify({ ...payload, signature }, signature, secret)).toBe(true);
  });

  it("canonicalizes object keys recursively while preserving array order", () => {
    expect(
      canonicalize({ z: 1, nested: { b: true, a: null }, list: ["first", "last"] }),
    ).toBe('{"list":["first","last"],"nested":{"a":null,"b":true},"z":1}');
    expect(canonicalize({ signature: "ignored", kept: "value", absent: undefined })).toBe(
      '{"kept":"value"}',
    );
  });

  it("rejects payload tampering and signatures made with another secret", () => {
    const signature = sign(payload, secret);

    expect(verify({ ...payload, building: "Other Building" }, signature, secret)).toBe(
      false,
    );
    expect(verify(payload, sign(payload, "other-secret"), secret)).toBe(false);
  });

  it.each(["", "not-hex", "abc", "00", "0".repeat(64)]) (
    "rejects malformed, unequal-length, or invalid hex signatures without throwing: %j",
    (signature) => {
      expect(() => verify(payload, signature, secret)).not.toThrow();
      expect(verify(payload, signature, secret)).toBe(false);
    },
  );

  it.each([undefined, null])(
    "rejects a non-string signature without throwing: %j",
    (signature) => {
      expect(verify(payload, signature as never, secret)).toBe(false);
    },
  );
});
