import { describe, expect, it, vi } from "vitest";

import {
  cancelIfEscapeKey,
  isDirectComboboxTextEdit,
} from "../maintenance-form";

describe("cancelIfEscapeKey", () => {
  it("cancels and reports handled when Escape fires while the popup is closed", () => {
    const cancel = vi.fn();

    const handled = cancelIfEscapeKey({ reason: "escape-key", cancel });

    expect(handled).toBe(true);
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it("leaves a real item selection alone", () => {
    const cancel = vi.fn();

    const handled = cancelIfEscapeKey({ reason: "item-press", cancel });

    expect(handled).toBe(false);
    expect(cancel).not.toHaveBeenCalled();
  });

  it("leaves other dismissal reasons (e.g. outside press) alone", () => {
    const cancel = vi.fn();

    const handled = cancelIfEscapeKey({ reason: "outside-press", cancel });

    expect(handled).toBe(false);
    expect(cancel).not.toHaveBeenCalled();
  });
});

describe("isDirectComboboxTextEdit", () => {
  it("treats a direct keystroke as invalidating the previous selection", () => {
    expect(isDirectComboboxTextEdit("input-change")).toBe(true);
  });

  it("does not treat a completed item selection as a text edit", () => {
    expect(isDirectComboboxTextEdit("item-press")).toBe(false);
  });

  it("does not treat Base UI's own input-clear sync as a text edit", () => {
    expect(isDirectComboboxTextEdit("input-clear")).toBe(false);
  });

  it("does not treat the closed-Escape sync as a text edit", () => {
    expect(isDirectComboboxTextEdit("escape-key")).toBe(false);
  });

  it("does not treat a programmatic sync (reason 'none') as a text edit", () => {
    expect(isDirectComboboxTextEdit("none")).toBe(false);
  });
});
