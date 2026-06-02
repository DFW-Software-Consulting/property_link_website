"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { primaryNavItems, siteConfig } from "@/lib/site-config";

function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const isActive = useIsActive();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/65">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {primaryNavItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
                isActive(item.href) ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <a
            href={siteConfig.phone.href}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-brand-strong"
          >
            <Phone className="size-4" aria-hidden />
            {siteConfig.phone.display}
          </a>
          <Button
            render={<Link href="/contact" />}
            nativeButton={false}
            variant="brand"
            size="xl"
          >
            Check Availability
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              />
            }
          >
            <Menu className="size-5" aria-hidden />
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-xs gap-0 p-0">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="border-b border-border p-4">
              <Logo />
            </div>
            <nav aria-label="Mobile" className="flex flex-col gap-1 p-4">
              {primaryNavItems.map((item) => (
                <SheetClose
                  key={item.label}
                  render={
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive(item.href)
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                    />
                  }
                >
                  {item.label}
                </SheetClose>
              ))}
            </nav>
            <div className="mt-auto flex flex-col gap-3 border-t border-border p-4">
              <a
                href={siteConfig.phone.href}
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Phone className="size-4" aria-hidden />
                {siteConfig.phone.display}
              </a>
              <Button
                render={<Link href="/contact" />}
                nativeButton={false}
                variant="brand"
                size="xl"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                Check Availability
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </Container>
    </header>
  );
}
