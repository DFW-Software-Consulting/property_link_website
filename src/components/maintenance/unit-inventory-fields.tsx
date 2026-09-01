"use client";

import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";

import { createComboboxSyncHandlers } from "@/lib/combobox-sync";
import { createTextFieldProps } from "@/lib/forms/text-field-props";
import type { MaintenanceFormInput } from "@/lib/schemas/maintenance";
import { Field } from "@/components/shared/form-field";
import { Input } from "@/components/ui/input";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

type BuildingFieldProps = {
  control: Control<MaintenanceFormInput>;
  register: UseFormRegister<MaintenanceFormInput>;
  errors: FieldErrors<MaintenanceFormInput>;
  hasUnitInventory: boolean;
  buildingNames: string[];
  setValue: UseFormSetValue<MaintenanceFormInput>;
};

/**
 * Building field: an inventory-backed Combobox when unit inventory is
 * available, a free-text Input fallback otherwise (kept working per
 * AGENTS.md). Selecting or clearing a building resets the dependent
 * apartment field.
 */
export function BuildingField({
  control,
  register,
  errors,
  hasUnitInventory,
  buildingNames,
  setValue,
}: BuildingFieldProps) {
  const text = createTextFieldProps(register, errors);

  return (
    <Field
      id="building"
      label="Building"
      required
      error={errors.building?.message}
    >
      {hasUnitInventory ? (
        <Controller
          control={control}
          name="building"
          render={({ field }) => {
            const { onValueChange, onInputValueChange } =
              createComboboxSyncHandlers(field.onChange, () =>
                setValue("apartment", "", { shouldValidate: true }),
              );
            return (
              <Combobox
                items={buildingNames}
                value={field.value}
                onValueChange={onValueChange}
                onInputValueChange={onInputValueChange}
                autoHighlight
              >
                <ComboboxInput
                  id="building"
                  className="w-full"
                  placeholder="Select your building"
                  triggerLabel="Show building options"
                  aria-invalid={errors.building ? true : undefined}
                  aria-describedby={
                    errors.building ? "building-error" : undefined
                  }
                />
                <ComboboxContent>
                  <ComboboxEmpty>No matching buildings.</ComboboxEmpty>
                  <ComboboxList>
                    {(building: string) => (
                      <ComboboxItem key={building} value={building}>
                        {building}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            );
          }}
        />
      ) : (
        <Input autoComplete="street-address" {...text("building")} />
      )}
    </Field>
  );
}

type ApartmentFieldProps = {
  control: Control<MaintenanceFormInput>;
  register: UseFormRegister<MaintenanceFormInput>;
  errors: FieldErrors<MaintenanceFormInput>;
  hasUnitInventory: boolean;
  units: string[];
  selectedBuilding: string;
};

/**
 * Apartment field: an inventory-backed Combobox scoped to the selected
 * building when unit inventory is available, a free-text Input fallback
 * otherwise.
 */
export function ApartmentField({
  control,
  register,
  errors,
  hasUnitInventory,
  units,
  selectedBuilding,
}: ApartmentFieldProps) {
  const text = createTextFieldProps(register, errors);

  return (
    <Field
      id="apartment"
      label="Apartment number"
      required
      error={errors.apartment?.message}
    >
      {hasUnitInventory ? (
        <Controller
          control={control}
          name="apartment"
          render={({ field }) => {
            const { onValueChange, onInputValueChange } =
              createComboboxSyncHandlers(field.onChange);
            return (
              <Combobox
                items={units}
                value={field.value}
                onValueChange={onValueChange}
                onInputValueChange={onInputValueChange}
                disabled={!selectedBuilding}
                autoHighlight
              >
                <ComboboxInput
                  id="apartment"
                  className="w-full"
                  placeholder={
                    selectedBuilding
                      ? "Select your apartment"
                      : "Select a building first"
                  }
                  triggerLabel="Show apartment options"
                  aria-invalid={errors.apartment ? true : undefined}
                  aria-describedby={
                    errors.apartment ? "apartment-error" : undefined
                  }
                />
                <ComboboxContent>
                  <ComboboxEmpty>No matching apartments.</ComboboxEmpty>
                  <ComboboxList>
                    {(unit: string) => (
                      <ComboboxItem key={unit} value={unit}>
                        {unit}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            );
          }}
        />
      ) : (
        <Input autoComplete="address-line2" {...text("apartment")} />
      )}
    </Field>
  );
}
