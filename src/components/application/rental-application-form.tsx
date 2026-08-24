"use client";

import { useCallback, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  rentalApplicationSchema,
  type RentalApplicationInput,
} from "@/lib/schemas/rental-application";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TurnstileWidget } from "@/components/maintenance/turnstile-widget";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
};

function Field({ id, label, error, required, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {required ? <span aria-hidden className="text-destructive"> *</span> : null}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

async function submitRentalApplication(formData: FormData) {
  const res = await fetch("/api/rental-application", {
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

export function RentalApplicationForm() {
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState<string | null>(null);
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

  const handleVerify = useCallback((token: string) => {
    setCaptchaToken(token);
    setCaptchaError(null);
  }, []);
  const handleExpire = useCallback(() => setCaptchaToken(""), []);

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

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      noValidate
      className="flex flex-col gap-6 rounded-xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8"
    >
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

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="fullName"
          label="Full name"
          required
          error={errors.fullName?.message}
        >
          <Input
            id="fullName"
            autoComplete="name"
            aria-invalid={errors.fullName ? true : undefined}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            {...register("fullName")}
          />
        </Field>

        <Field id="email" label="Email" required error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
        </Field>

        <Field
          id="phone"
          label="Phone (optional)"
          error={errors.phone?.message}
        >
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            {...register("phone")}
          />
        </Field>

        <Field
          id="building"
          label="Desired building (optional)"
          error={errors.building?.message}
        >
          <Input
            id="building"
            autoComplete="off"
            aria-invalid={errors.building ? true : undefined}
            aria-describedby={errors.building ? "building-error" : undefined}
            {...register("building")}
          />
        </Field>

        <Field
          id="moveInDate"
          label="Desired move-in (optional)"
          error={errors.moveInDate?.message}
        >
          <Input
            id="moveInDate"
            type="month"
            aria-invalid={errors.moveInDate ? true : undefined}
            aria-describedby={errors.moveInDate ? "moveInDate-error" : undefined}
            {...register("moveInDate")}
          />
        </Field>

        <Field
          id="occupants"
          label="Number of occupants (optional)"
          error={errors.occupants?.message}
        >
          <Input
            id="occupants"
            type="number"
            min={1}
            max={20}
            aria-invalid={errors.occupants ? true : undefined}
            aria-describedby={errors.occupants ? "occupants-error" : undefined}
            {...register("occupants", { valueAsNumber: true })}
          />
        </Field>
      </div>

      <Field id="message" label="Message (optional)" error={errors.message?.message}>
        <Textarea
          id="message"
          rows={5}
          placeholder="Tell us anything helpful about your housing needs."
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "message-error" : undefined}
          {...register("message")}
        />
      </Field>

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
