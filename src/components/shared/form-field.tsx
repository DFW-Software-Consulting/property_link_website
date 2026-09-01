"use client";

import { Label } from "@/components/ui/label";

export type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
};

/**
 * Label + control + optional hint/error, shared across the maintenance and
 * application forms. `hint` is optional and unused by forms that never had
 * one (rendering nothing in that case, same as before this was shared).
 */
export function Field({ id, label, error, required, hint, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {required ? <span aria-hidden className="text-destructive"> *</span> : null}
      </Label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
