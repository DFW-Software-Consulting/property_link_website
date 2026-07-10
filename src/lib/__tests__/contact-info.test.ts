import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getCmsCompanyInfo } from "@/lib/cms/client";
import { siteConfig } from "@/lib/site-config";

import { getSiteContactInfo, telHref } from "../contact-info";

vi.mock("@/lib/cms/client", () => ({
  getCmsCompanyInfo: vi.fn(),
}));

const mockGetCmsCompanyInfo = vi.mocked(getCmsCompanyInfo);

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("telHref", () => {
  it("keeps a leading + and strips separators", () => {
    expect(telHref("+1 (212) 555-0100")).toBe("tel:+12125550100");
  });

  it("omits + when the number has no country code", () => {
    expect(telHref("888-622-0772")).toBe("tel:8886220772");
  });
});

describe("getSiteContactInfo", () => {
  it("prefers CMS values and derives a dialable phone href", async () => {
    mockGetCmsCompanyInfo.mockResolvedValue({
      phone: "+1 (212) 555-0100",
      email: "leasing@propertylinknyc.com",
    });

    await expect(getSiteContactInfo()).resolves.toEqual({
      phone: { display: "+1 (212) 555-0100", href: "tel:+12125550100" },
      email: "leasing@propertylinknyc.com",
    });
  });

  it("falls back to siteConfig when the CMS is unreachable", async () => {
    mockGetCmsCompanyInfo.mockResolvedValue(null);

    await expect(getSiteContactInfo()).resolves.toEqual({
      phone: { display: siteConfig.phone.display, href: siteConfig.phone.href },
      email: siteConfig.email,
    });
  });

  it("falls back per-field when the CMS returns empty strings", async () => {
    mockGetCmsCompanyInfo.mockResolvedValue({ phone: "", email: "" });

    await expect(getSiteContactInfo()).resolves.toEqual({
      phone: { display: siteConfig.phone.display, href: siteConfig.phone.href },
      email: siteConfig.email,
    });
  });
});
