"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import {
  maintenanceFormSchema,
  validatePhotos,
  type MaintenanceFormInput,
} from "@/lib/schemas/maintenance";
import type { MaintenanceUnitInventory } from "@/lib/cms/types";
import { siteConfig } from "@/lib/site-config";
import { TURNSTILE_SITE_KEY } from "@/lib/turnstile";
import { postFormRequest } from "@/lib/forms/post-form-request";
import { createTextFieldProps } from "@/lib/forms/text-field-props";
import { useTurnstileCaptcha } from "@/hooks/use-turnstile-captcha";
import { usePhotoUpload } from "@/hooks/use-photo-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/shared/form-field";
import { CaptchaField } from "@/components/shared/captcha-field";
import { HoneypotField } from "@/components/shared/honeypot-field";
import { BuildingField, ApartmentField } from "./unit-inventory-fields";
import { PermissionFieldset } from "./permission-fieldset";
import { PetFieldset } from "./pet-fieldset";
import { PhotoUploadField } from "./photo-upload-field";

export { cancelIfEscapeKey, isDirectComboboxTextEdit } from "@/lib/combobox-sync";

async function submitMaintenanceRequest(formData: FormData) {
  return postFormRequest(
    "/api/maintenance",
    formData,
    "Failed to submit your request",
  );
}

type MaintenanceFormProps = {
  unitInventory?: MaintenanceUnitInventory | null;
};

export function MaintenanceForm({
  unitInventory = null,
}: MaintenanceFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { photos, photoError, fileInputRef, addFiles, removePhoto, setPhotoError, resetPhotos } =
    usePhotoUpload();
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
  const buildingNames =
    unitInventory?.buildings.map((building) => building.name) ?? [];
  const units =
    unitInventory?.buildings.find(
      (building) => building.name === selectedBuilding,
    )?.units ?? [];

  const mutation = useMutation({
    mutationFn: submitMaintenanceRequest,
    onSuccess: () => {
      setIsSubmitted(true);
      reset();
      resetPhotos();
      setCaptchaToken("");
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          `Something went wrong. Please call us at ${siteConfig.phone.display}.`,
      );
    },
  });

  function handleSubmitAnother() {
    setIsSubmitted(false);
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

  if (isSubmitted) {
    return (
      <div
        role="status"
        className="flex animate-in flex-col items-center gap-4 rounded-xl bg-card p-6 text-center ring-1 ring-foreground/10 fade-in sm:p-8"
      >
        <CheckCircle2 className="size-10 text-brand-strong" aria-hidden />
        <div className="flex flex-col gap-1">
          <p className="text-lg font-medium">Thank you.</p>
          <p className="text-muted-foreground">
            Your request was sent, and you will hear from us shortly.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={handleSubmitAnother}>
          Submit another request
        </Button>
      </div>
    );
  }

  const text = createTextFieldProps(register, errors);

  return (
    <form
      onSubmit={handleSubmit(onValid)}
      noValidate
      className="flex flex-col gap-6 rounded-xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8"
    >
      {/* Honeypot: hidden from users, attractive to bots. */}
      <HoneypotField register={register} />

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

        <BuildingField
          control={control}
          register={register}
          errors={errors}
          hasUnitInventory={hasUnitInventory}
          buildingNames={buildingNames}
          setValue={setValue}
        />

        <ApartmentField
          control={control}
          register={register}
          errors={errors}
          hasUnitInventory={hasUnitInventory}
          units={units}
          selectedBuilding={selectedBuilding}
        />

        <Field id="phone" label="Phone" required error={errors.phone?.message}>
          <Input type="tel" autoComplete="tel" {...text("phone")} />
        </Field>

        <Field id="email" label="Email" required error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...text("email")} />
        </Field>
      </div>

      <Field
        id="message"
        label="How can we help?"
        required
        error={errors.message?.message}
      >
        <Textarea
          rows={5}
          placeholder="Describe the issue, where it is, and any access notes."
          {...text("message")}
        />
      </Field>

      <PermissionFieldset
        control={control}
        error={errors.permissionToEnter?.message}
      />

      <PetFieldset control={control} error={errors.petInResidence?.message} />

      <PhotoUploadField
        photos={photos}
        photoError={photoError}
        fileInputRef={fileInputRef}
        onAddFiles={addFiles}
        onRemovePhoto={removePhoto}
      />

      {/* CAPTCHA */}
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
        {mutation.isPending ? "Submitting…" : "Submit request"}
        {mutation.isPending ? null : <ArrowRight aria-hidden />}
      </Button>
    </form>
  );
}
