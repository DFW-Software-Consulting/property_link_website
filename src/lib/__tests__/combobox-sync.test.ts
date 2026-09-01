import { describe, expect, it, vi } from "vitest";

import {
  cancelIfEscapeKey,
  createComboboxSyncHandlers,
  isDirectComboboxTextEdit,
} from "../combobox-sync";

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
});

describe("isDirectComboboxTextEdit", () => {
  it("treats a direct keystroke as invalidating the previous selection", () => {
    expect(isDirectComboboxTextEdit("input-change")).toBe(true);
  });

  it("does not treat a completed item selection as a text edit", () => {
    expect(isDirectComboboxTextEdit("item-press")).toBe(false);
  });
});

describe("createComboboxSyncHandlers", () => {
  it("onValueChange commits the selected value and runs onCommit", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const cancel = vi.fn();
    const { onValueChange } = createComboboxSyncHandlers(onChange, onCommit);

    onValueChange("Maple Court", { reason: "item-press", cancel });

    expect(onChange).toHaveBeenCalledWith("Maple Court");
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(cancel).not.toHaveBeenCalled();
  });

  it("onValueChange falls back to an empty string for a null value", () => {
    const onChange = vi.fn();
    const { onValueChange } = createComboboxSyncHandlers(onChange);

    onValueChange(null, { reason: "clear-press", cancel: vi.fn() });

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("onValueChange cancels Escape and skips onChange/onCommit", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const cancel = vi.fn();
    const { onValueChange } = createComboboxSyncHandlers(onChange, onCommit);

    onValueChange("Maple Court", { reason: "escape-key", cancel });

    expect(cancel).toHaveBeenCalledTimes(1);
    expect(onChange).not.toHaveBeenCalled();
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("onInputValueChange clears the value and runs onCommit on a direct edit", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const { onInputValueChange } = createComboboxSyncHandlers(
      onChange,
      onCommit,
    );

    onInputValueChange("Ma", { reason: "input-change", cancel: vi.fn() });

    expect(onChange).toHaveBeenCalledWith("");
    expect(onCommit).toHaveBeenCalledTimes(1);
  });

  it("onInputValueChange ignores non-direct-edit reasons", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const { onInputValueChange } = createComboboxSyncHandlers(
      onChange,
      onCommit,
    );

    onInputValueChange("Maple Court", { reason: "none", cancel: vi.fn() });

    expect(onChange).not.toHaveBeenCalled();
    expect(onCommit).not.toHaveBeenCalled();
  });
});
