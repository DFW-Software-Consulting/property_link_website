"use client";

import { useId } from "react";
import { Controller, type Control } from "react-hook-form";

import {
  PERMISSION_OPTIONS,
  type MaintenanceFormInput,
  type PermissionValue,
} from "@/lib/schemas/maintenance";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type PermissionFieldsetProps = {
  control: Control<MaintenanceFormInput>;
  error?: string;
};

export function PermissionFieldset({ control, error }: PermissionFieldsetProps) {
  const permissionLegendId = useId();

  return (
    <fieldset
      className="flex flex-col gap-3"
      aria-labelledby={permissionLegendId}
      aria-invalid={error ? true : undefined}
    >
      <legend id={permissionLegendId} className="text-sm font-medium">
        Permission to enter
        <span aria-hidden className="text-destructive"> *</span>
      </legend>
      <Controller
        control={control}
        name="permissionToEnter"
        render={({ field }) => (
          <RadioGroup
            value={field.value ?? ""}
            onValueChange={(value) => field.onChange(value as PermissionValue)}
            aria-describedby={error ? "permission-error" : undefined}
          >
            {PERMISSION_OPTIONS.map((option) => (
              <Label
                key={option.value}
                className="flex cursor-pointer items-start gap-3 font-normal text-muted-foreground"
              >
                <RadioGroupItem value={option.value} className="mt-0.5" />
                <span>{option.label}</span>
              </Label>
            ))}
          </RadioGroup>
        )}
      />
      {error ? (
        <p id="permission-error" role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
