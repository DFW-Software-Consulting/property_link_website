"use client";

import { useCallback, useId, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, Upload, X } from "lucide-react";
import {
  ACCEPTED_IMAGE_ACCEPT,
  MAX_PHOTOS,
  PERMISSION_OPTIONS,
  PET_OPTIONS,
  maintenanceFormSchema,
  validatePhotos,
  type MaintenanceFormInput,
  type PermissionValue,
} from "@/lib/schemas/maintenance";
import type { MaintenanceUnitInventory } from "@/lib/cms/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TurnstileWidget } from "@/components/maintenance/turnstile-widget";
import { siteConfig } from "@/lib/site-config";

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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function submitMaintenanceRequest(formData: FormData) {
  const res = await fetch("/api/maintenance", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(data?.error ?? "Failed to submit your request");
  }
  return res.json();
}

type MaintenanceFormProps = {
  unitInventory?: MaintenanceUnitInventory | null;
};

export function MaintenanceForm({
  unitInventory = null,
}: MaintenanceFormProps) {
  const photosLabelId = useId();
  const permissionLegendId = useId();
  const petLegendId = useId();

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MaintenanceFormInput>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      building: "",
      apartment: "",
      phone: "",
      email: "",
      message: "",
      permissionToEnter: undefined,
      petInResidence: undefined,
      captchaToken: "",
      website: "",
    },
  });

  const selectedBuilding = watch("building");
  const hasUnitInventory = (unitInventory?.buildings.length ?? 0) > 0;
  const units =
    unitInventory?.buildings.find(
      (building) => building.name === selectedBuilding,
    )?.units ?? [];

  const handleVerify = useCallback((token: string) => {
    setCaptchaToken(token);
    setCaptchaError(null);
  }, []);
  const handleExpire = useCallback(() => setCaptchaToken(""), []);

  const mutation = useMutation({
    mutationFn: submitMaintenanceRequest,
    onSuccess: () => {
      toast.success(
        "Request received — our maintenance team will follow up shortly.",
      );
      reset();
      setPhotos([]);
      setPhotoError(null);
      setCaptchaToken("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          `Something went wrong. Please call us at ${siteConfig.phone.display}.`,
      );
    },
  });

  function addFiles(incoming: FileList | null) {
    if (!incoming || incoming.length === 0) return;
    const next = [...photos, ...Array.from(incoming)].slice(0, MAX_PHOTOS);
    const result = validatePhotos(next);
    if (!result.ok) {
      setPhotoError(result.error);
      return;
    }
    setPhotoError(null);
    setPhotos(next);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((current) => current.filter((_, i) => i !== index));
    setPhotoError(null);
  }

  function onValid(values: MaintenanceFormInput) {
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setCaptchaError("Please complete the verification challenge.");
      return;
    }
    const photoCheck = validatePhotos(photos);
    if (!photoCheck.ok) {
      setPhotoError(photoCheck.error);
      return;
    }

    const formData = new FormData();
    formData.append("firstName", values.firstName);
    formData.append("lastName", values.lastName);
    formData.append("building", values.building);
    formData.append("apartment", values.apartment);
    formData.append("phone", values.phone);
    formData.append("email", values.email);
    formData.append("message", values.message);
    formData.append("permissionToEnter", values.permissionToEnter);
    formData.append("petInResidence", values.petInResidence);
    formData.append("captchaToken", captchaToken);
    formData.append("website", values.website ?? "");
    for (const photo of photos) {
      formData.append("photos", photo, photo.name);
    }

    mutation.mutate(formData);
  }

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      noValidate
      className="flex flex-col gap-6 rounded-xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8"
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

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="firstName"
          label="First name"
          required
          error={errors.firstName?.message}
        >
          <Input
            id="firstName"
            autoComplete="given-name"
            aria-invalid={errors.firstName ? true : undefined}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
            {...register("firstName")}
          />
        </Field>

        <Field
          id="lastName"
          label="Last name"
          required
          error={errors.lastName?.message}
        >
          <Input
            id="lastName"
            autoComplete="family-name"
            aria-invalid={errors.lastName ? true : undefined}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
            {...register("lastName")}
          />
        </Field>

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
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("apartment", "", { shouldValidate: true });
                  }}
                >
                  <SelectTrigger
                    id="building"
                    className="w-full"
                    aria-invalid={errors.building ? true : undefined}
                    aria-describedby={
                      errors.building ? "building-error" : undefined
                    }
                  >
                    <SelectValue placeholder="Select your building" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitInventory?.buildings.map((building) => (
                      <SelectItem key={building.name} value={building.name}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          ) : (
            <Input
              id="building"
              autoComplete="street-address"
              aria-invalid={errors.building ? true : undefined}
              aria-describedby={errors.building ? "building-error" : undefined}
              {...register("building")}
            />
          )}
        </Field>

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
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!selectedBuilding}
                >
                  <SelectTrigger
                    id="apartment"
                    className="w-full"
                    aria-invalid={errors.apartment ? true : undefined}
                    aria-describedby={
                      errors.apartment ? "apartment-error" : undefined
                    }
                  >
                    <SelectValue
                      placeholder={
                        selectedBuilding
                          ? "Select your apartment"
                          : "Select a building first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          ) : (
            <Input
              id="apartment"
              autoComplete="address-line2"
              aria-invalid={errors.apartment ? true : undefined}
              aria-describedby={
                errors.apartment ? "apartment-error" : undefined
              }
              {...register("apartment")}
            />
          )}
        </Field>

        <Field id="phone" label="Phone" required error={errors.phone?.message}>
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            {...register("phone")}
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
      </div>

      <Field
        id="message"
        label="How can we help?"
        required
        error={errors.message?.message}
      >
        <Textarea
          id="message"
          rows={5}
          placeholder="Describe the issue, where it is, and any access notes."
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "message-error" : undefined}
          {...register("message")}
        />
      </Field>

      {/* Permission to enter */}
      <fieldset
        className="flex flex-col gap-3"
        aria-labelledby={permissionLegendId}
        aria-invalid={errors.permissionToEnter ? true : undefined}
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
              aria-describedby={
                errors.permissionToEnter ? "permission-error" : undefined
              }
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
        {errors.permissionToEnter ? (
          <p
            id="permission-error"
            role="alert"
            className="text-sm text-destructive"
          >
            {errors.permissionToEnter.message}
          </p>
        ) : null}
      </fieldset>

      {/* Pet in residence */}
      <fieldset
        className="flex flex-col gap-3"
        aria-labelledby={petLegendId}
        aria-invalid={errors.petInResidence ? true : undefined}
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
              aria-describedby={errors.petInResidence ? "pet-error" : undefined}
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
        {errors.petInResidence ? (
          <p id="pet-error" role="alert" className="text-sm text-destructive">
            {errors.petInResidence.message}
          </p>
        ) : null}
      </fieldset>

      {/* Photo upload */}
      <div className="flex flex-col gap-2">
        <span id={photosLabelId} className="text-sm font-medium">
          Photos{" "}
          <span className="font-normal text-muted-foreground">
            (optional — JPG, PNG, or GIF, up to 5 MB each)
          </span>
        </span>
        <label
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-transparent px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          aria-describedby={photoError ? "photos-error" : undefined}
        >
          <Upload className="size-4" aria-hidden />
          <span>Click to add photos</span>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_ACCEPT}
            multiple
            className="sr-only"
            aria-labelledby={photosLabelId}
            onChange={(event) => addFiles(event.target.files)}
          />
        </label>

        {photos.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {photos.map((photo, index) => (
              <li
                key={`${photo.name}-${index}`}
                className="flex items-center justify-between gap-3 rounded-md bg-secondary/50 px-3 py-2 text-sm ring-1 ring-foreground/10"
              >
                <span className="truncate">{photo.name}</span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="text-muted-foreground">
                    {formatBytes(photo.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="grid size-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                    aria-label={`Remove ${photo.name}`}
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {photoError ? (
          <p id="photos-error" role="alert" className="text-sm text-destructive">
            {photoError}
          </p>
        ) : null}
      </div>

      {/* CAPTCHA */}
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
        {mutation.isPending ? "Submitting…" : "Submit request"}
        {mutation.isPending ? null : <ArrowRight aria-hidden />}
      </Button>
    </form>
  );
}
