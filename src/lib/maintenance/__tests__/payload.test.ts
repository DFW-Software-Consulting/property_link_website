import { describe, expect, it, vi } from "vitest";

import { verify } from "../signature";
import { buildMaintenancePayload, signMaintenancePayload } from "../payload";

const input = {
  firstName: "Ana",
  lastName: "García",
  email: "ana@example.com",
  phone: "+1 212 555 0100",
  building: "Maple Court",
  apartment: "12C",
  message: "The heater is not working.",
  permissionToEnter: "coordinate" as const,
  petInResidence: false,
  photos: [{ filename: "heater.jpg", contentType: "image/jpeg" }],
};

describe("maintenance payloads", () => {
  it("constructs the ingest contract with an injected submission timestamp", () => {
    expect(
      buildMaintenancePayload({ ...input, submittedAt: "2026-08-09T12:00:00.000Z" }),
    ).toEqual({
      formVersion: 1,
      submittedAt: "2026-08-09T12:00:00.000Z",
      contact: {
        firstName: "Ana",
        lastName: "García",
        email: "ana@example.com",
        phone: "+1 212 555 0100",
      },
      building: "Maple Court",
      apartment: "12C",
      message: "The heater is not working.",
      permissionToEnter: "coordinate",
      petInResidence: false,
      photos: [{ filename: "heater.jpg", contentType: "image/jpeg" }],
    });
  });

  it("uses the current ISO timestamp when none is supplied", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-09T12:00:00.000Z"));

    expect(buildMaintenancePayload(input).submittedAt).toBe("2026-08-09T12:00:00.000Z");

    vi.useRealTimers();
  });

  it("preserves supplied empty optional-like values and omits unexpected input fields", () => {
    const payload = buildMaintenancePayload({
      ...input,
      apartment: "",
      photos: [],
      extra: "must not enter the ingest contract",
    } as typeof input);

    expect(payload.apartment).toBe("");
    expect(payload.photos).toEqual([]);
    expect(payload).not.toHaveProperty("extra");
  });

  it("appends a signature that verifies the constructed payload", () => {
    const payload = buildMaintenancePayload({
      ...input,
      submittedAt: "2026-08-09T12:00:00.000Z",
    });
    const signed = signMaintenancePayload(payload, "shared-secret");

    expect(signed).toMatchObject(payload);
    expect(verify(signed, signed.signature, "shared-secret")).toBe(true);
  });
});
