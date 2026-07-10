/**
 * Resolves the public contact details (phone + email) rendered site-wide.
 *
 * Prefers the values managed in the Emmut CMS (`/api/public/cms/company-info`)
 * so staff can update them without a redeploy, and falls back to the static
 * `siteConfig` values when the CMS is unreachable or a field is unset. This is
 * a graceful degradation, mirroring how the rest of the CMS client behaves.
 *
 * Server-only: it reads the server-side CMS client. Client Components receive
 * the resolved `SiteContactInfo` as a prop from a Server Component.
 */
import "server-only";

import { getCmsCompanyInfo } from "@/lib/cms/client";
import { siteConfig, type SiteContactInfo } from "@/lib/site-config";

/** Build a `tel:` href from a display phone number (keeps a leading `+`). */
export function telHref(phone: string): string {
  const trimmed = phone.trim();
  const prefix = trimmed.startsWith("+") ? "+" : "";
  return `tel:${prefix}${trimmed.replace(/\D/g, "")}`;
}

export async function getSiteContactInfo(): Promise<SiteContactInfo> {
  const cms = await getCmsCompanyInfo();

  const phoneDisplay = cms?.phone.trim() || siteConfig.phone.display;
  const email = cms?.email.trim() || siteConfig.email;

  return {
    phone: {
      display: phoneDisplay,
      // Reuse the vetted static href when the CMS phone is empty; otherwise
      // derive a dialable href from the CMS value.
      href: cms?.phone.trim() ? telHref(cms.phone) : siteConfig.phone.href,
    },
    email,
  };
}
