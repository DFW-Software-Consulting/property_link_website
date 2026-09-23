"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Building2 } from "lucide-react";
import {
  contactInquirySchema,
  INQUIRY_TYPES,
  inquiryTypeLabels,
  UNIT_SIZES,
  unitSizeLabels,
  type ContactInquiryInput,
  type InquiryType,
  type UnitSize,
} from "@/lib/schemas/contact";
import { minMoveOutDate } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { siteConfig } from "@/lib/site-config";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
};

function Field({ id, label, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

async function submitInquiry(values: ContactInquiryInput) {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(data?.error ?? "Failed to send your message");
  }
  return res.json();
}

type ContactFormProps = {
  /** Prefill when opened from a building page. */
  building?: string;
  buildingSlug?: string;
  initialInquiryType?: InquiryType;
};

export function ContactForm({
  building,
  buildingSlug,
  initialInquiryType,
}: ContactFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<ContactInquiryInput>({
    resolver: zodResolver(contactInquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      inquiryType: initialInquiryType ?? "general",
      unitSize: "",
      building: building ?? "",
      buildingSlug: buildingSlug ?? "",
      company: "",
      moveInDate: "",
      moveOutDate: "",
      message: building ? `I'm interested in ${building}.` : "",
      consent: false,
      website: "",
    },
  });

  const inquiryType = watch("inquiryType");
  const moveInDate = watch("moveInDate");
  const sizeOptional = inquiryType === "general";
  const moveOutRequired = inquiryType === "short_term" || inquiryType === "corporate";

  // Set the picker's earliest date after mount: it depends on today's date,
  // which the server and the browser can disagree about mid-render.
  const [earliestMoveOut, setEarliestMoveOut] = useState<string | undefined>();
  useEffect(() => {
    setEarliestMoveOut(minMoveOutDate(moveInDate?.trim() || undefined));
  }, [moveInDate]);

  const mutation = useMutation({
    mutationFn: submitInquiry,
    onSuccess: () => {
      toast.success("Thanks, we'll be in touch shortly.");
      reset();
    },
    onError: () => {
      toast.error(
        `Something went wrong. Please call us at ${siteConfig.phone.display}.`,
      );
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      noValidate
      className="flex flex-col gap-5 rounded-xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8"
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

      {/* Property context carried from a building page. */}
      <input type="hidden" {...register("building")} />
      <input type="hidden" {...register("buildingSlug")} />

      {building ? (
        <div className="flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2.5 text-sm ring-1 ring-foreground/10">
          <Building2 aria-hidden className="size-4 shrink-0 text-brand-strong" />
          <span>
            Inquiring about{" "}
            <strong className="font-medium text-foreground">{building}</strong>
          </span>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Name" error={errors.name?.message}>
          <Input
            id="name"
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
        </Field>

        <Field id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
        </Field>

        <Field id="phone" label="Phone (optional)" error={errors.phone?.message}>
          <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
        </Field>

        <Field
          id="inquiryType"
          label="I'm interested in"
          error={errors.inquiryType?.message}
        >
          <Controller
            control={control}
            name="inquiryType"
            render={({ field }) => (
              <Select
                items={inquiryTypeLabels}
                value={field.value}
                onValueChange={(value) => field.onChange(value as InquiryType)}
              >
                <SelectTrigger id="inquiryType" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INQUIRY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {inquiryTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="unitSize"
          label={`Apartment size${sizeOptional ? " (optional)" : ""}`}
          error={errors.unitSize?.message}
        >
          <Controller
            control={control}
            name="unitSize"
            render={({ field }) => (
              <Select
                items={unitSizeLabels}
                value={field.value ?? ""}
                onValueChange={(value) => field.onChange(value as UnitSize)}
              >
                <SelectTrigger
                  id="unitSize"
                  className="w-full"
                  aria-invalid={errors.unitSize ? true : undefined}
                  aria-describedby={errors.unitSize ? "unitSize-error" : undefined}
                >
                  <SelectValue placeholder="Select a size" />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {unitSizeLabels[size]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field
          id="company"
          label="Company (optional)"
          error={errors.company?.message}
        >
          <Input
            id="company"
            autoComplete="organization"
            {...register("company")}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="moveInDate"
          label="Desired move-in (optional)"
          error={errors.moveInDate?.message}
        >
          <Input id="moveInDate" type="date" {...register("moveInDate")} />
        </Field>

        <Field
          id="moveOutDate"
          label={`Desired move-out${moveOutRequired ? "" : " (optional)"}`}
          error={errors.moveOutDate?.message}
        >
          <Input
            id="moveOutDate"
            type="date"
            min={earliestMoveOut}
            aria-invalid={errors.moveOutDate ? true : undefined}
            aria-describedby={errors.moveOutDate ? "moveOutDate-error" : undefined}
            {...register("moveOutDate")}
          />
          <p className="text-sm text-muted-foreground">
            Stays run 30 days or longer.
          </p>
        </Field>
      </div>

      <Field id="message" label="How can we help?" error={errors.message?.message}>
        <Textarea
          id="message"
          rows={5}
          placeholder="Tell us your dates, neighborhood, and what you're looking for."
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "message-error" : undefined}
          {...register("message")}
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-3">
          <Controller
            control={control}
            name="consent"
            render={({ field }) => (
              <Checkbox
                id="consent"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                aria-invalid={errors.consent ? true : undefined}
                aria-describedby={errors.consent ? "consent-error" : undefined}
              />
            )}
          />
          <Label htmlFor="consent" className="font-normal text-muted-foreground">
            I agree to be contacted by {siteConfig.shortName} about my inquiry.
          </Label>
        </div>
        {errors.consent ? (
          <p id="consent-error" role="alert" className="text-sm text-destructive">
            {errors.consent.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        variant="brand"
        size="xl"
        disabled={mutation.isPending}
        className="w-full sm:w-fit"
      >
        {mutation.isPending ? "Sending…" : "Send message"}
        {mutation.isPending ? null : <ArrowRight aria-hidden />}
      </Button>
    </form>
  );
}
