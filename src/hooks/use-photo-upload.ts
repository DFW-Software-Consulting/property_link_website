"use client";

import { useRef, useState } from "react";

import { MAX_PHOTOS, validatePhotos } from "@/lib/schemas/maintenance";

/**
 * State + handlers for the maintenance form's photo upload field: the
 * selected files, a validation error, and the uncontrolled file input ref
 * (cleared imperatively after a successful add or a full-form reset).
 */
export function usePhotoUpload() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function resetPhotos() {
    setPhotos([]);
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return {
    photos,
    photoError,
    setPhotoError,
    fileInputRef,
    addFiles,
    removePhoto,
    resetPhotos,
  };
}
