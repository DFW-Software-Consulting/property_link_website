"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  applicationInquirySchema,
  validatePassportFile,
  type ApplicationInquiryInput,
} from "@/lib/schemas/application-inquiry";
import { siteConfig } from "@/lib/site-config";
import { TURNSTILE_SITE_KEY } from "@/lib/turnstile";
import { postFormRequest } from "@/lib/forms/post-form-request";
import { createTextFieldProps } from "@/lib/forms/text-field-props";
import { useTurnstileCaptcha } from "@/hooks/use-turnstile-captcha";
import { Button } from "@/components/ui/button";
import { CaptchaField } from "@/components/shared/captcha-field";
import { HoneypotField } from "@/components/shared/honeypot-field";
import {
  ApplicantSection,
  EmergencyHomeSection,
  EmergencyUsSection,
  ImmigrationSection,
  LandlordSection,
  PaymentSection,
  RelativeSection,
  TenancySection,
} from "./international-inquiry-sections";

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

async function submitInternationalApplication(formData: FormData) {
  return postFormRequest(
    "/api/application-inquiry",
    formData,
    "Failed to submit your application",
  );
}

export function InternationalInquiryForm() {
  const {
    captchaToken,
    captchaError,
    setCaptchaToken,
    setCaptchaError,
    handleVerify,
    handleExpire,
  } = useTurnstileCaptcha();
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

  function handlePassportChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPassportFile(event.currentTarget.files?.[0] ?? null);
    setPassportError(null);
  }

  const text = createTextFieldProps(register, errors);

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      noValidate
      className="flex flex-col gap-8 rounded-xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8"
    >
      {/* Honeypot: hidden from users, attractive to bots. */}
      <HoneypotField register={register} />

      <ApplicantSection control={control} errors={errors} text={text} />

      <ImmigrationSection
        errors={errors}
        text={text}
        passportError={passportError}
        passportInputKey={passportInputKey}
        onPassportChange={handlePassportChange}
      />

      <LandlordSection errors={errors} text={text} />

      <RelativeSection errors={errors} text={text} />

      <TenancySection control={control} errors={errors} text={text} />

      <EmergencyUsSection errors={errors} text={text} />

      <EmergencyHomeSection errors={errors} text={text} />

      <PaymentSection errors={errors} text={text} />

      {TURNSTILE_SITE_KEY ? (
        <CaptchaField
          siteKey={TURNSTILE_SITE_KEY}
          captchaError={captchaError}
          onVerify={handleVerify}
          onExpire={handleExpire}
        />
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
