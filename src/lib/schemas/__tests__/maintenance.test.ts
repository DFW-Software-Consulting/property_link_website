import { describe, expect, it } from "vitest";

import { maintenanceFormSchema } from "../maintenance";

const validForm = {
  firstName: "Ana",
  lastName: "García",
  building: "Maple Court",
  apartment: "12C",
  phone: "+1 212 555 0112",
  email: "ana@example.com",
  message: "The heater is not working in the bedroom.",
  permissionToEnter: "coordinate",
  petInResidence: "no",
};

describe("maintenanceFormSchema", () => {
  it("accepts building and apartment strings returned by the live inventory", () => {
    expect(maintenanceFormSchema.safeParse(validForm).success).toBe(true);
  });

  it("continues to validate building and apartment as required strings", () => {
    expect(
      maintenanceFormSchema.safeParse({
        ...validForm,
        building: "",
        apartment: "",
      }).success,
    ).toBe(false);
  });
});
