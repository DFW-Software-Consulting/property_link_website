"use client";

import { useId } from "react";
import { Controller, type Control } from "react-hook-form";

import { PET_OPTIONS, type MaintenanceFormInput } from "@/lib/schemas/maintenance";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type PetFieldsetProps = {
  control: Control<MaintenanceFormInput>;
  error?: string;
};

export function PetFieldset({ control, error }: PetFieldsetProps) {
  const petLegendId = useId();

  return (
    <fieldset
      className="flex flex-col gap-3"
      aria-labelledby={petLegendId}
      aria-invalid={error ? true : undefined}
    >
      <legend id={petLegendId} className="text-sm font-medium">
        Pet in residence?
        <span aria-hidden className="text-destructive"> *</span>
      </legend>
      <Controller
        control={control}
        name="petInResidence"
        render={({ field }) => (
          <RadioGroup
            value={field.value ?? ""}
            onValueChange={field.onChange}
            className="flex flex-row gap-6"
            aria-describedby={error ? "pet-error" : undefined}
          >
            {PET_OPTIONS.map((option) => (
              <Label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 font-normal text-muted-foreground"
              >
                <RadioGroupItem value={option.value} />
                <span>{option.label}</span>
              </Label>
            ))}
          </RadioGroup>
        )}
      />
      {error ? (
        <p id="pet-error" role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
