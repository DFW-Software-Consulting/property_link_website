"use client";

import { TurnstileWidget } from "@/components/maintenance/turnstile-widget";

type CaptchaFieldProps = {
  siteKey: string;
  captchaError: string | null;
  onVerify: (token: string) => void;
  onExpire: () => void;
};

/**
 * Turnstile widget plus its inline error message. Callers are responsible
 * for only rendering this when a site key is configured (`TURNSTILE_SITE_KEY`
 * from `@/lib/turnstile`).
 */
export function CaptchaField({
  siteKey,
  captchaError,
  onVerify,
  onExpire,
}: CaptchaFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <TurnstileWidget siteKey={siteKey} onVerify={onVerify} onExpire={onExpire} />
      {captchaError ? (
        <p role="alert" className="text-sm text-destructive">
          {captchaError}
        </p>
      ) : null}
    </div>
  );
}
