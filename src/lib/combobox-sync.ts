/**
 * Keeps Base UI's `Combobox` in sync with react-hook-form state. Base UI's
 * change callbacks receive `eventDetails` with a `reason` and a `cancel()`
 * — see `src/components/maintenance/maintenance-form.tsx` and the
 * "UI primitives" section of AGENTS.md for the pattern this codifies.
 */
export type ComboboxChangeEventDetails = {
  reason: string;
  cancel: () => void;
};

/**
 * Base UI's Combobox clears the committed value when Escape is pressed while
 * the popup is already closed — there's nothing open to dismiss. The native
 * `<select>` this replaced left the value untouched in that case, so cancel
 * Base UI's default handling and preserve the committed selection.
 */
export function cancelIfEscapeKey(
  eventDetails: ComboboxChangeEventDetails,
): boolean {
  if (eventDetails.reason !== "escape-key") return false;
  eventDetails.cancel();
  return true;
}

/**
 * Base UI keeps the previously committed value while the user free-types a
 * query that no longer matches it — only the displayed text changes. A
 * direct edit ("input-change") must invalidate that stale selection so a
 * mismatched value can never be submitted; syncs that follow a real
 * selection, a clear, or Escape use other reasons and are left alone.
 */
export function isDirectComboboxTextEdit(reason: string): boolean {
  return reason === "input-change";
}

/**
 * Builds the `onValueChange`/`onInputValueChange` pair a Combobox-backed RHF
 * field needs, per `cancelIfEscapeKey`/`isDirectComboboxTextEdit` above.
 * `onCommit` (optional) runs after every committed change — selection,
 * clear, or direct text edit — for fields that must cascade a reset to a
 * dependent field (e.g. clearing "apartment" when "building" changes).
 *
 * Plain closures, not memoized — matches how these handlers were previously
 * written inline in each Controller `render` prop.
 */
export function createComboboxSyncHandlers(
  onChange: (value: string) => void,
  onCommit?: () => void,
) {
  return {
    onValueChange(
      value: string | null,
      eventDetails: ComboboxChangeEventDetails,
    ) {
      if (cancelIfEscapeKey(eventDetails)) return;
      onChange(value ?? "");
      onCommit?.();
    },
    onInputValueChange(
      _value: string,
      eventDetails: ComboboxChangeEventDetails,
    ) {
      if (cancelIfEscapeKey(eventDetails)) return;
      if (!isDirectComboboxTextEdit(eventDetails.reason)) return;
      onChange("");
      onCommit?.();
    },
  };
}
