"use client";

import { useId } from "react";
import { Upload, X } from "lucide-react";

import { ACCEPTED_IMAGE_ACCEPT } from "@/lib/schemas/maintenance";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type PhotoUploadFieldProps = {
  photos: File[];
  photoError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onAddFiles: (incoming: FileList | null) => void;
  onRemovePhoto: (index: number) => void;
};

export function PhotoUploadField({
  photos,
  photoError,
  fileInputRef,
  onAddFiles,
  onRemovePhoto,
}: PhotoUploadFieldProps) {
  const photosLabelId = useId();

  return (
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
          onChange={(event) => onAddFiles(event.target.files)}
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
                  onClick={() => onRemovePhoto(index)}
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
  );
}
