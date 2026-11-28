import "server-only";

import { env } from "@/lib/env";

import {
  conciergeReplySchema,
  type ConciergeReply,
  type ConciergeRequestInput,
} from "./schema";

const CONCIERGE_TIMEOUT_MS = 8000;

function conciergeEndpoint(): string {
  return `${env.CMS_API_URL.replace(/\/+$/, "")}/api/public/cms/concierge`;
}

export class ConciergeApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ConciergeApiError";
  }
}

export async function checkConciergeEnabled(): Promise<boolean> {
  try {
    const response = await fetch(conciergeEndpoint(), {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return false;
    const payload = (await response.json().catch(() => ({}))) as { data?: { enabled?: boolean } };
    return payload.data?.enabled === true;
  } catch {
    return false;
  }
}

export async function sendConciergeMessage(input: ConciergeRequestInput): Promise<ConciergeReply> {
  const response = await fetch(conciergeEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
    signal: AbortSignal.timeout(CONCIERGE_TIMEOUT_MS),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    data?: unknown;
    error?: string | { message?: string };
  };

  if (!response.ok) {
    const errMsg =
      typeof payload.error === "string"
        ? payload.error
        : payload.error?.message || `Concierge request failed (${response.status})`;
    throw new ConciergeApiError(errMsg, response.status);
  }

  return conciergeReplySchema.parse(payload.data);
}
