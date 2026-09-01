"use client";

import { useCallback, useState } from "react";

/**
 * Shared Cloudflare Turnstile state for a form: the verified token, an
 * optional client-side error (e.g. "please complete the CAPTCHA"), and the
 * two callbacks `TurnstileWidget` invokes on verify/expire. Raw setters are
 * returned (not a combined "reset") because each form's mutation resets a
 * different subset of this state on success.
 */
export function useTurnstileCaptcha() {
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  const handleVerify = useCallback((token: string) => {
    setCaptchaToken(token);
    setCaptchaError(null);
  }, []);
  const handleExpire = useCallback(() => setCaptchaToken(""), []);

  return {
    captchaToken,
    captchaError,
    setCaptchaToken,
    setCaptchaError,
    handleVerify,
    handleExpire,
  };
}
