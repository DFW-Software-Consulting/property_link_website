"use client";

import type { FieldValues, Path, UseFormRegister } from "react-hook-form";

type HoneypotFieldProps<TFieldValues extends FieldValues> = {
  register: UseFormRegister<TFieldValues>;
};

/**
 * Hidden "website" field, identical across every intake form: invisible to
 * real users via `sr-only`, but bots that autofill every input tend to fill
 * it in — a non-empty value is treated as spam server-side. Every form's
 * schema declares an optional `website: string` field for this.
 */
export function HoneypotField<TFieldValues extends FieldValues>({
  register,
}: HoneypotFieldProps<TFieldValues>) {
  return (
    <div className="sr-only" aria-hidden>
      <label htmlFor="website">Website</label>
      <input
        id="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        {...register("website" as Path<TFieldValues>)}
      />
    </div>
  );
}
