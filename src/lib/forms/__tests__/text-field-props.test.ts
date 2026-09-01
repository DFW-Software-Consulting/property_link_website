import { describe, expect, it, vi } from "vitest";

import { createTextFieldProps } from "../text-field-props";

type Values = { fullName: string; occupants: number };

describe("createTextFieldProps", () => {
  it("omits aria attributes and forwards register when the field is valid", () => {
    const register = vi.fn().mockReturnValue({
      name: "fullName",
      onChange: vi.fn(),
      onBlur: vi.fn(),
      ref: vi.fn(),
    });
    const text = createTextFieldProps<Values>(register, {});

    const props = text("fullName");

    expect(props.id).toBe("fullName");
    expect(props["aria-invalid"]).toBeUndefined();
    expect(props["aria-describedby"]).toBeUndefined();
    expect(register).toHaveBeenCalledWith("fullName", undefined);
    expect(props.name).toBe("fullName");
  });

  it("sets aria-invalid and aria-describedby when the field has an error", () => {
    const register = vi.fn().mockReturnValue({});
    const text = createTextFieldProps<Values>(register, {
      fullName: { type: "required", message: "Full name is required" },
    });

    const props = text("fullName");

    expect(props["aria-invalid"]).toBe(true);
    expect(props["aria-describedby"]).toBe("fullName-error");
  });

  it("forwards register options unchanged", () => {
    const register = vi.fn().mockReturnValue({});
    const text = createTextFieldProps<Values>(register, {});

    text("occupants", { valueAsNumber: true });

    expect(register).toHaveBeenCalledWith("occupants", { valueAsNumber: true });
  });
});
