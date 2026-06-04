import { sign } from "./signature";

/**
 * The exact submission.json contract consumed by the property-management
 * ingest. Built in one place so the API route and the signature test exercise
 * identical code. Server-only (transitively imports `node:crypto`).
 */

export const FORM_VERSION = 1 as const;

export const PERMISSION_TO_ENTER = ["yes", "no", "coordinate"] as const;
export type PermissionToEnter = (typeof PERMISSION_TO_ENTER)[number];

export type MaintenancePhotoMeta = {
  filename: string;
  contentType: string;
};

export type MaintenancePayload = {
  formVersion: typeof FORM_VERSION;
  submittedAt: string;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  building: string;
  apartment: string;
  message: string;
  permissionToEnter: PermissionToEnter;
  petInResidence: boolean;
  photos: MaintenancePhotoMeta[];
};

export type SignedMaintenancePayload = MaintenancePayload & {
  signature: string;
};

export type BuildMaintenancePayloadInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  building: string;
  apartment: string;
  message: string;
  permissionToEnter: PermissionToEnter;
  petInResidence: boolean;
  photos: MaintenancePhotoMeta[];
  /** ISO 8601 timestamp; defaults to now. Injectable for deterministic tests. */
  submittedAt?: string;
};

export function buildMaintenancePayload(
  input: BuildMaintenancePayloadInput,
): MaintenancePayload {
  return {
    formVersion: FORM_VERSION,
    submittedAt: input.submittedAt ?? new Date().toISOString(),
    contact: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
    },
    building: input.building,
    apartment: input.apartment,
    message: input.message,
    permissionToEnter: input.permissionToEnter,
    petInResidence: input.petInResidence,
    photos: input.photos,
  };
}

/** Returns the payload with the hex HMAC appended as `signature`. */
export function signMaintenancePayload(
  payload: MaintenancePayload,
  secret: string,
): SignedMaintenancePayload {
  return { ...payload, signature: sign(payload, secret) };
}
