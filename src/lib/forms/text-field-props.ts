import type {
  FieldErrors,
  FieldPath,
  FieldValues,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";

/**
 * Shared props for a plain text-ish input bound to RHF: `id`, `aria-invalid`,
 * `aria-describedby` (pointing at the field's `${name}-error` message), and
 * the `register(name, options)` spread. Centralizes the
 * `errors[name] ? ... : undefined` pattern each form otherwise repeats once
 * per field. `options` forwards to `register` unchanged (e.g. a field that
 * needs `{ valueAsNumber: true }`). Only top-level field names are supported
 * (every field across these forms is top-level).
 */
export function createTextFieldProps<TFieldValues extends FieldValues>(
  register: UseFormRegister<TFieldValues>,
  errors: FieldErrors<TFieldValues>,
) {
  const errorsByName = errors as Record<
    string,
    { message?: string } | undefined
  >;

  return function textFieldProps<TName extends FieldPath<TFieldValues>>(
    name: TName,
    options?: RegisterOptions<TFieldValues, TName>,
  ) {
    return {
      id: name,
      "aria-invalid": errorsByName[name] ? (true as const) : undefined,
      "aria-describedby": errorsByName[name] ? `${name}-error` : undefined,
      ...register(name, options),
    };
  };
}
