"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  rentalApplicationSchema,
  type RentalApplicationInput,
} from "@/lib/schemas/rental-application";
import { siteConfig } from "@/lib/site-config";
import { TURNSTILE_SITE_KEY } from "@/lib/turnstile";
import { postFormRequest } from "@/lib/forms/post-form-request";
import { createTextFieldProps } from "@/lib/forms/text-field-props";
import { useTurnstileCaptcha } from "@/hooks/use-turnstile-captcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/shared/form-field";
import { CaptchaField } from "@/components/shared/captcha-field";
import { HoneypotField } from "@/components/shared/honeypot-field";

async function submitRentalApplication(formData: FormData) {
  return postFormRequest(
    "/api/rental-application",
    formData,
    "Failed to submit your application",
  );
}

export function RentalApplicationForm() {
  const {
    captchaToken,
    captchaError,
    setCaptchaToken,
    setCaptchaError,
    handleVerify,
    handleExpire,
  } = useTurnstileCaptcha();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RentalApplicationInput>({
    resolver: zodResolver(rentalApplicationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      building: "",
      moveInDate: "",
      occupants: undefined,
      message: "",
      captchaToken: "",
      website: "",
    },
  });

  const mutation = useMutation({
    mutationFn: submitRentalApplication,
    onSuccess: () => {
      toast.success("Thanks — our leasing team will be in touch shortly.");
      reset();
      setCaptchaToken("");
      setCaptchaError(null);
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          `Something went wrong. Please call us at ${siteConfig.phone.display}.`,
      );
    },
  });

  function onValid(values: RentalApplicationInput) {
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setCaptchaError("Please complete the CAPTCHA before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", values.fullName);
    formData.append("email", values.email);
    formData.append("phone", values.phone ?? "");
    formData.append("building", values.building ?? "");
    formData.append("moveInDate", values.moveInDate ?? "");
    formData.append("occupants", values.occupants != null ? String(values.occupants) : "");
    formData.append("message", values.message ?? "");
    formData.append("captchaToken", captchaToken);
    formData.append("website", values.website ?? "");
    mutation.mutate(formData);
  }

  const text = createTextFieldProps(register, errors);

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      noValidate
      className="flex flex-col gap-6 rounded-xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8"
    >
      <HoneypotField register={register} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="fullName"
          label="Full name"
          required
          error={errors.fullName?.message}
        >
          <Input autoComplete="name" {...text("fullName")} />
        </Field>

        <Field id="email" label="Email" required error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...text("email")} />
        </Field>

        <Field
          id="phone"
          label="Phone (optional)"
          error={errors.phone?.message}
        >
          <Input type="tel" autoComplete="tel" {...text("phone")} />
        </Field>

        <Field
          id="building"
          label="Desired building (optional)"
          error={errors.building?.message}
        >
          <Input autoComplete="off" {...text("building")} />
        </Field>

        <Field
          id="moveInDate"
          label="Desired move-in (optional)"
          error={errors.moveInDate?.message}
        >
          <Input type="month" {...text("moveInDate")} />
        </Field>

        <Field
          id="occupants"
          label="Number of occupants (optional)"
          error={errors.occupants?.message}
        >
          <Input
            type="number"
            min={1}
            max={20}
            {...text("occupants", { valueAsNumber: true })}
          />
        </Field>
      </div>

      <Field id="message" label="Message (optional)" error={errors.message?.message}>
        <Textarea
          rows={5}
          placeholder="Tell us anything helpful about your housing needs."
          {...text("message")}
        />
      </Field>

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
