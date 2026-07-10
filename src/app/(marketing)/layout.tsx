import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getSiteContactInfo } from "@/lib/contact-info";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contact = await getSiteContactInfo();

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <SiteHeader contact={contact} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter contact={contact} />
    </>
  );
}
