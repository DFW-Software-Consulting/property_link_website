import { env } from "@/lib/env";

/**
 * Server-side CAPTCHA verification (Cloudflare Turnstile).
 *
 * The secret never reaches the browser. When `TURNSTILE_SECRET_KEY` is unset
 * we skip verification (with a loud warning) so local dev and CI builds work
 * without keys — production MUST set it. Cloudflare's always-pass test keys
 * are documented in `.env.example` for local development.
 */

const VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isCaptchaConfigured(): boolean {
  return Boolean(env.TURNSTILE_SECRET_KEY);
}

type CaptchaResult = { success: boolean; reason?: string };

type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
};

export async function verifyCaptcha(
  token: string | null | undefined,
  remoteIp?: string,
): Promise<CaptchaResult> {
  const secret = env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.warn(
      "[maintenance] CAPTCHA not configured (TURNSTILE_SECRET_KEY missing) — skipping verification. Set it in production.",
    );
    return { success: true, reason: "not-configured" };
  }

  if (!token) return { success: false, reason: "missing-token" };

  const body = new URLSearchParams();
  body.append("secret", secret);
  body.append("response", token);
  if (remoteIp) body.append("remoteip", remoteIp);

  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body });
    const data = (await res.json()) as TurnstileResponse;
    return {
      success: data.success === true,
      reason: data["error-codes"]?.join(",") || undefined,
    };
  } catch (error) {
    console.error("[maintenance] CAPTCHA verification request failed:", error);
    return { success: false, reason: "verify-request-failed" };
  }
}
