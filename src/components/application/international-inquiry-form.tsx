"use client";

import { useCallback, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ACCEPTED_PASSPORT_ACCEPT,
  applicationInquirySchema,
  GENDER_LABELS,
  GENDER_OPTIONS,
  validatePassportFile,
  type ApplicationInquiryInput,
} from "@/lib/schemas/application-inquiry";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TurnstileWidget } from "@/components/maintenance/turnstile-widget";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** Every text-ish key the form posts, in the order the API expects them. */
const TEXT_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "gender",
  "dateOfBirth",
  "countryOfCitizenship",
  "passportIdNumber",
  "visaType",
  "visaExpirationDate",
  "landlordFirstName",
  "landlordLastName",
  "landlordPhone",
  "relativeName",
  "relativePhone",
  "relationship",
  "desiredAddress",
  "desiredMoveInDate",
  "hasPets",
  "emergencyUsFirstName",
  "emergencyUsLastName",
  "emergencyUsPhone",
  "emergencyUsEmail",
  "emergencyHomeFirstName",
  "emergencyHomeLastName",
  "emergencyHomePhone",
  "emergencyHomeEmail",
  "cardholderName",
  "creditCardNumber",
  "cardExpirationDate",
  "securityCode",
] as const satisfies readonly (keyof ApplicationInquiryInput)[];

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
};

function Field({ id, label, error, required, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span aria-hidden className="text-destructive">
            {" "}
            *
          </span>
        ) : null}
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

async function submitInternationalApplication(formData: FormData) {
  const res = await fetch("/api/application-inquiry", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(data?.error ?? "Failed to submit your application");
  }
  return res.json();
}

export function InternationalInquiryForm() {
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [passportError, setPassportError] = useState<string | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  // Bumped on reset to remount (and therefore clear) the uncontrolled file input.
  const [passportInputKey, setPassportInputKey] = useState(0);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplicationInquiryInput>({
    resolver: zodResolver(applicationInquirySchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: undefined,
      dateOfBirth: "",
      countryOfCitizenship: "",
      passportIdNumber: "",
      visaType: "",
      visaExpirationDate: "",
      landlordFirstName: "",
      landlordLastName: "",
      landlordPhone: "",
      relativeName: "",
      relativePhone: "",
      relationship: "",
      desiredAddress: "",
      desiredMoveInDate: "",
      hasPets: undefined,
      emergencyUsFirstName: "",
      emergencyUsLastName: "",
      emergencyUsPhone: "",
      emergencyUsEmail: "",
      emergencyHomeFirstName: "",
      emergencyHomeLastName: "",
      emergencyHomePhone: "",
      emergencyHomeEmail: "",
      cardholderName: "",
      creditCardNumber: "",
      cardExpirationDate: "",
      securityCode: "",
      captchaToken: "",
      website: "",
    },
  });

  const handleVerify = useCallback((token: string) => {
    setCaptchaToken(token);
    setCaptchaError(null);
  }, []);
  const handleExpire = useCallback(() => setCaptchaToken(""), []);

  const mutation = useMutation({
    mutationFn: submitInternationalApplication,
    onSuccess: () => {
      toast.success(
        "Thanks — our leasing team will be in touch within one business day.",
      );
      reset();
      setCaptchaToken("");
      setCaptchaError(null);
      setPassportError(null);
      setPassportFile(null);
      setPassportInputKey((key) => key + 1);
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          `Something went wrong. Please call us at ${siteConfig.phone.display}.`,
      );
    },
  });

  function onValid(values: ApplicationInquiryInput) {
    const passportCheck = validatePassportFile(passportFile);
    if (!passportCheck.ok) {
      setPassportError(passportCheck.error);
      return;
    }
    setPassportError(null);

    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setCaptchaError("Please complete the CAPTCHA before submitting.");
      return;
    }

    const formData = new FormData();
    for (const key of TEXT_FIELDS) {
      formData.append(key, values[key] ?? "");
    }
    formData.append("captchaToken", captchaToken);
    formData.append("website", values.website ?? "");
    // Non-null: validatePassportFile rejects a missing file above.
    formData.append("passport", passportFile as File);
    mutation.mutate(formData);
  }

  /** Shared props for a plain text input bound to RHF. */
  const text = (name: (typeof TEXT_FIELDS)[number]) => ({
    id: name,
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
    ...register(name),
  });

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      noValidate
      className="flex flex-col gap-8 rounded-xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8"
    >
      {/* Honeypot: hidden from users, attractive to bots. */}
      <div className="sr-only" aria-hidden>
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

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
            aria-describedby={
              passportError ? "passport-error" : "passport-hint"
            }
            onChange={(event) => {
              setPassportFile(event.currentTarget.files?.[0] ?? null);
              setPassportError(null);
            }}
            className="h-auto py-1.5"
          />
        </Field>
      </Fieldset>

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
            <Input
              type="email"
              autoComplete="off"
              {...text("emergencyUsEmail")}
            />
          </Field>
        </div>
      </Fieldset>

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
            <Input
              type="tel"
              autoComplete="off"
              {...text("emergencyHomePhone")}
            />
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

      {TURNSTILE_SITE_KEY ? (
        <div className="flex flex-col gap-2">
          <TurnstileWidget
            siteKey={TURNSTILE_SITE_KEY}
            onVerify={handleVerify}
            onExpire={handleExpire}
          />
          {captchaError ? (
            <p role="alert" className="text-sm text-destructive">
              {captchaError}
            </p>
          ) : null}
        </div>
      ) : null}

      <Button
        type="submit"
        variant="brand"
        size="xl"
        disabled={mutation.isPending}
        className="w-full sm:w-fit"
      >
        {mutation.isPending ? "Sending…" : "Submit application"}
        {mutation.isPending ? null : <ArrowRight aria-hidden />}
      </Button>
    </form>
  );
}
