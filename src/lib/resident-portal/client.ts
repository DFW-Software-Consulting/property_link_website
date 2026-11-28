import "server-only";

import { env } from "@/lib/env";

import {
  residentPortalOverviewSchema,
  type PortalRenewalRequestInput,
  type ResidentPortalOverview,
} from "./schema";

export const RESIDENT_SESSION_COOKIE = "plw_resident_session";

const REQUEST_TIMEOUT_MS = 5000;

function portalApiBase(): string {
  return env.CMS_API_URL.replace(/\/+$/, "");
}

export class ResidentPortalApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ResidentPortalApiError";
  }
}

async function fetchPortalBackend<T>(
  path: string,
  options: {
    method?: "GET" | "POST";
    body?: unknown;
    sessionToken?: string;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.sessionToken) {
    headers.Authorization = `Bearer ${options.sessionToken}`;
  }

  const response = await fetch(`${portalApiBase()}/api/public/resident-portal${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    data?: T;
    error?: string | { message?: string };
  };

  if (!response.ok) {
    const errMsg =
      typeof payload.error === "string"
        ? payload.error
        : payload.error?.message || `Portal request failed (${response.status})`;
    throw new ResidentPortalApiError(errMsg, response.status);
  }

  return payload.data as T;
}

export async function checkResidentPortalEnabled(): Promise<boolean> {
  try {
    const data = await fetchPortalBackend<{ enabled?: boolean }>("/status");
    return data?.enabled === true;
  } catch {
    return false;
  }
}

export async function requestPortalMagicLink(email: string): Promise<{ sent: boolean }> {
  return fetchPortalBackend<{ sent: boolean }>("/request-link", {
    method: "POST",
    body: { email },
  });
}

export async function verifyPortalToken(
  token: string,
): Promise<{ email: string; sessionToken: string; expiresAt: string }> {
  return fetchPortalBackend<{ email: string; sessionToken: string; expiresAt: string }>("/verify", {
    method: "POST",
    body: { token },
  });
}

export async function fetchPortalOverview(sessionToken: string): Promise<ResidentPortalOverview> {
  const raw = await fetchPortalBackend<unknown>("/overview", {
    method: "GET",
    sessionToken,
  });
  return residentPortalOverviewSchema.parse(raw);
}

export async function replyMaintenanceThread(
  sessionToken: string,
  requestId: number,
  body: string,
): Promise<unknown> {
  return fetchPortalBackend(`/maintenance/${requestId}/reply`, {
    method: "POST",
    sessionToken,
    body: { body },
  });
}

export async function requestLeaseRenewal(
  sessionToken: string,
  input: PortalRenewalRequestInput,
): Promise<unknown> {
  return fetchPortalBackend("/renewal-request", {
    method: "POST",
    sessionToken,
    body: input,
  });
}
