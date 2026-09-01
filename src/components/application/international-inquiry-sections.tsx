"use client";

import { Controller, type Control, type FieldErrors } from "react-hook-form";

import {
  ACCEPTED_PASSPORT_ACCEPT,
  GENDER_LABELS,
  GENDER_OPTIONS,
  type ApplicationInquiryInput,
} from "@/lib/schemas/application-inquiry";
import type { createTextFieldProps } from "@/lib/forms/text-field-props";
import { Field } from "@/components/shared/form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Shared props for a plain text-ish field bound to this form's RHF state. */
type TextFieldGetter = ReturnType<
  typeof createTextFieldProps<ApplicationInquiryInput>
>;

type SectionErrors = FieldErrors<ApplicationInquiryInput>;

function Fieldset({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-5 border-t border-foreground/10 pt-6 first:border-0 first:pt-0">
      <legend className="sr-only">{title}</legend>
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </fieldset>
  );
}

type ApplicantSectionProps = {
  control: Control<ApplicationInquiryInput>;
  errors: SectionErrors;
  text: TextFieldGetter;
};

export function ApplicantSection({ control, errors, text }: ApplicantSectionProps) {
  return (
    <Fieldset title="Applicant">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="firstName"
          label="First name"
          required
          error={errors.firstName?.message}
        >
          <Input autoComplete="given-name" {...text("firstName")} />
        </Field>

        <Field
          id="lastName"
          label="Last name"
          required
          error={errors.lastName?.message}
        >
          <Input autoComplete="family-name" {...text("lastName")} />
        </Field>

        <Field id="email" label="Email" required error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...text("email")} />
        </Field>

        <Field id="phone" label="Phone" required error={errors.phone?.message}>
          <Input type="tel" autoComplete="tel" {...text("phone")} />
        </Field>

        <Field
          id="gender"
          label="Gender"
          required
          error={errors.gender?.message}
        >
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={(value) =>
                  field.onChange(value as ApplicationInquiryInput["gender"])
                }
              >
                <SelectTrigger id="gender" className="w-full">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {GENDER_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field
          id="dateOfBirth"
          label="Date of birth"
          required
          error={errors.dateOfBirth?.message}
        >
          <Input type="date" autoComplete="bday" {...text("dateOfBirth")} />
        </Field>
      </div>
    </Fieldset>
  );
}

type ImmigrationSectionProps = {
  errors: SectionErrors;
  text: TextFieldGetter;
  passportError: string | null;
  passportInputKey: number;
  onPassportChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function ImmigrationSection({
  errors,
  text,
  passportError,
  passportInputKey,
  onPassportChange,
}: ImmigrationSectionProps) {
  return (
    <Fieldset
      title="Immigration"
      description="We need a clear copy of your passport to verify your identity."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="countryOfCitizenship"
          label="Country of citizenship"
          required
          error={errors.countryOfCitizenship?.message}
        >
          <Input
            autoComplete="country-name"
            {...text("countryOfCitizenship")}
          />
        </Field>

        <Field
          id="passportIdNumber"
          label="Passport / ID number"
          required
          error={errors.passportIdNumber?.message}
        >
          <Input autoComplete="off" {...text("passportIdNumber")} />
        </Field>

        <Field
          id="visaType"
          label="Visa type"
          required
          error={errors.visaType?.message}
        >
          <Input autoComplete="off" {...text("visaType")} />
        </Field>

        <Field
          id="visaExpirationDate"
          label="Visa expiration date"
          required
          error={errors.visaExpirationDate?.message}
        >
          <Input type="date" {...text("visaExpirationDate")} />
        </Field>
      </div>

      <Field
        id="passport"
        label="Passport copy"
        required
        hint="JPG, PNG, WEBP, or PDF up to 8 MB."
        error={passportError ?? undefined}
      >
        <Input
          key={passportInputKey}
          id="passport"
          name="passport"
          type="file"
          accept={ACCEPTED_PASSPORT_ACCEPT}
          aria-invalid={passportError ? true : undefined}
          aria-describedby={passportError ? "passport-error" : "passport-hint"}
          onChange={onPassportChange}
          className="h-auto py-1.5"
        />
      </Field>
    </Fieldset>
  );
}

type LandlordSectionProps = {
  errors: SectionErrors;
  text: TextFieldGetter;
};

export function LandlordSection({ errors, text }: LandlordSectionProps) {
  return (
    <Fieldset title="Current landlord">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="landlordFirstName"
          label="Landlord first name"
          required
          error={errors.landlordFirstName?.message}
        >
          <Input autoComplete="off" {...text("landlordFirstName")} />
        </Field>

        <Field
          id="landlordLastName"
          label="Landlord last name"
          required
          error={errors.landlordLastName?.message}
        >
          <Input autoComplete="off" {...text("landlordLastName")} />
        </Field>

        <Field
          id="landlordPhone"
          label="Landlord phone"
          required
          error={errors.landlordPhone?.message}
        >
          <Input type="tel" autoComplete="off" {...text("landlordPhone")} />
        </Field>
      </div>
    </Fieldset>
  );
}

type RelativeSectionProps = {
  errors: SectionErrors;
  text: TextFieldGetter;
};

export function RelativeSection({ errors, text }: RelativeSectionProps) {
  return (
    <Fieldset title="Relative reference">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="relativeName"
          label="Relative's name"
          required
          error={errors.relativeName?.message}
        >
          <Input autoComplete="off" {...text("relativeName")} />
        </Field>

        <Field
          id="relativePhone"
          label="Relative's phone"
          required
          error={errors.relativePhone?.message}
        >
          <Input type="tel" autoComplete="off" {...text("relativePhone")} />
        </Field>

        <Field
          id="relationship"
          label="Relationship"
          required
          error={errors.relationship?.message}
        >
          <Input autoComplete="off" {...text("relationship")} />
        </Field>
      </div>
    </Fieldset>
  );
}

type TenancySectionProps = {
  control: Control<ApplicationInquiryInput>;
  errors: SectionErrors;
  text: TextFieldGetter;
};

export function TenancySection({ control, errors, text }: TenancySectionProps) {
  return (
    <Fieldset title="Tenancy">
      <Field
        id="desiredAddress"
        label="Address you're applying for"
        required
        error={errors.desiredAddress?.message}
      >
        <Input autoComplete="off" {...text("desiredAddress")} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="desiredMoveInDate"
          label="Desired move-in date"
          required
          error={errors.desiredMoveInDate?.message}
        >
          <Input type="date" {...text("desiredMoveInDate")} />
        </Field>

        <Field
          id="hasPets"
          label="Any pets?"
          required
          error={errors.hasPets?.message}
        >
          <Controller
            control={control}
            name="hasPets"
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={(value) =>
                  field.onChange(value as ApplicationInquiryInput["hasPets"])
                }
              >
                <SelectTrigger id="hasPets" className="w-full">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>
    </Fieldset>
  );
}

type EmergencyUsSectionProps = {
  errors: SectionErrors;
  text: TextFieldGetter;
};

export function EmergencyUsSection({ errors, text }: EmergencyUsSectionProps) {
  return (
    <Fieldset
      title="Emergency contact — United States"
      description="Someone we can reach in the U.S. if we can't reach you."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="emergencyUsFirstName"
          label="First name"
          required
          error={errors.emergencyUsFirstName?.message}
        >
          <Input autoComplete="off" {...text("emergencyUsFirstName")} />
        </Field>

        <Field
          id="emergencyUsLastName"
          label="Last name"
          required
          error={errors.emergencyUsLastName?.message}
        >
          <Input autoComplete="off" {...text("emergencyUsLastName")} />
        </Field>

        <Field
          id="emergencyUsPhone"
          label="Phone"
          required
          error={errors.emergencyUsPhone?.message}
        >
          <Input type="tel" autoComplete="off" {...text("emergencyUsPhone")} />
        </Field>

        <Field
          id="emergencyUsEmail"
          label="Email"
          required
          error={errors.emergencyUsEmail?.message}
        >
          <Input type="email" autoComplete="off" {...text("emergencyUsEmail")} />
        </Field>
      </div>
    </Fieldset>
  );
}

type EmergencyHomeSectionProps = {
  errors: SectionErrors;
  text: TextFieldGetter;
};

export function EmergencyHomeSection({
  errors,
  text,
}: EmergencyHomeSectionProps) {
  return (
    <Fieldset title="Emergency contact — home country">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="emergencyHomeFirstName"
          label="First name"
          required
          error={errors.emergencyHomeFirstName?.message}
        >
          <Input autoComplete="off" {...text("emergencyHomeFirstName")} />
        </Field>

        <Field
          id="emergencyHomeLastName"
          label="Last name"
          required
          error={errors.emergencyHomeLastName?.message}
        >
          <Input autoComplete="off" {...text("emergencyHomeLastName")} />
        </Field>

        <Field
          id="emergencyHomePhone"
          label="Phone"
          required
          error={errors.emergencyHomePhone?.message}
        >
          <Input type="tel" autoComplete="off" {...text("emergencyHomePhone")} />
        </Field>

        <Field
          id="emergencyHomeEmail"
          label="Email"
          required
          error={errors.emergencyHomeEmail?.message}
        >
          <Input
            type="email"
            autoComplete="off"
            {...text("emergencyHomeEmail")}
          />
        </Field>
      </div>
    </Fieldset>
  );
}

type PaymentSectionProps = {
  errors: SectionErrors;
  text: TextFieldGetter;
};

export function PaymentSection({ errors, text }: PaymentSectionProps) {
  return (
    <Fieldset
      title="Payment"
      description="Used for the application fee. We never charge anything without confirming with you first."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="cardholderName"
          label="Name on card"
          required
          error={errors.cardholderName?.message}
        >
          <Input autoComplete="cc-name" {...text("cardholderName")} />
        </Field>

        <Field
          id="creditCardNumber"
          label="Card number"
          required
          error={errors.creditCardNumber?.message}
        >
          <Input
            inputMode="numeric"
            autoComplete="cc-number"
            {...text("creditCardNumber")}
          />
        </Field>

        <Field
          id="cardExpirationDate"
          label="Expiration date"
          required
          error={errors.cardExpirationDate?.message}
        >
          <Input
            type="month"
            autoComplete="cc-exp"
            {...text("cardExpirationDate")}
          />
        </Field>

        <Field
          id="securityCode"
          label="Security code"
          required
          error={errors.securityCode?.message}
        >
          <Input
            inputMode="numeric"
            autoComplete="cc-csc"
            {...text("securityCode")}
          />
        </Field>
      </div>
    </Fieldset>
  );
}
