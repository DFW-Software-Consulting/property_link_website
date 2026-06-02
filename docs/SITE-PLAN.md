# PropertyLink NYC — Site Plan & Content Inventory

A redesign of [propertylinknyc.com](https://www.propertylinknyc.com/) to modern 2026 standards,
keeping the original content and business purpose while improving visual hierarchy, spacing,
typography, trust signals, responsiveness, and conversion. This document is the content/structure
reference. **Phase 1 (built): Home, About, Services, Contact.**

---

## 1. Overview & Positioning

- **Company:** PropertyLink Management NYC — a Manhattan furnished-housing provider, est. 2015.
- **Differentiator:** They **only rent apartments in buildings they own** ("owner-operated").
- **Offerings:** Short-term furnished stays (30+ days), long-term rentals, corporate/relocation housing.
- **NAP:** 888-622-0772 · info@propertylinknyc.com · 521 West 48th Street, Suite 1A, New York, NY 10036.
- **Hours:** Mon–Fri 9:00 AM–6:00 PM EST; closed weekends.
- **Social:** Instagram @propertylinknyc · Facebook /Propertylinknyc.
- **Voice:** Confident, warm, concrete. Lead with the owner-operated advantage and "move-in ready."
  Single source of truth for all of the above: `src/lib/site-config.ts`.

---

## 2. Information Architecture & Navigation

### Sitemap

| Page | Route | Status |
|------|-------|--------|
| Home | `/` | ✅ Built |
| About | `/about` | ✅ Built |
| Services | `/services` (anchors `#short-term`, `#long-term`, `#corporate`) | ✅ Built |
| Contact | `/contact` | ✅ Built |
| Properties (listings) | `/properties` | ⏳ Future |
| Residents portal | `/residents` | ⏳ Future |
| Short-Term Stays (dedicated) | `/short-term` | ⏳ Future (consolidated into /services for now) |
| Long-Term Rentals (dedicated) | `/long-term` | ⏳ Future |
| Privacy Policy | `/privacy` | ⏳ Future (footer link currently points to /contact) |

Routes live under a `(marketing)` route group (`src/app/(marketing)/`) with one shared layout
(`SiteHeader` + `SiteFooter`). Future pages drop into the same group with no IA change.

### Primary navigation (header)
`Home · About · Services · Contact` + persistent **"Check Availability"** CTA (→ `/contact`) and a
click-to-call phone link on desktop. Mobile uses a slide-out sheet. Nav is data-driven from
`navItems` / `primaryNavItems` in `site-config.ts` — add a page in one line. `Properties` and
`Residents` are defined as `upcoming` and hidden until built.

### Footer
Four areas: **Brand** (wordmark, tagline, Instagram/Facebook) · **Explore** (Home/About/Services/Contact) ·
**Services** (anchor links to the three offerings) · **Contact** (address, phone, email, hours).
Bottom bar: `© {year} PropertyLink Management NYC` + Privacy Policy link.

---

## 3. Page Specs & SEO

Global: title template `%s | PropertyLink NYC`, `metadataBase: https://www.propertylinknyc.com`,
default OpenGraph + Twitter `summary_large_image` (set in `src/app/layout.tsx`).

### Home — `/`
Sections: **Hero** (real building photo + navy gradient, H1 "Furnished Manhattan apartments, in
buildings we own.", CTAs) → **TrustBar** (est. 2015 · 7 buildings · 4 neighborhoods · 1-day response)
→ **Why PropertyLink** (4 value props) → **What's included** (6 amenities) → **Our buildings**
(7 PropertyCards, `#properties`) → **Resident reviews** (3 testimonials) → **Trusted by** (client strip)
→ **CTA band**.
- **Title:** `PropertyLink NYC | Furnished Apartments in Manhattan` (default)
- **Description:** "PropertyLink NYC offers move-in-ready furnished apartments for short- and long-term
  stays across Manhattan. We own and manage every building we rent — from Little Italy to the Upper East Side."

### About — `/about`
Sections: intro/founding hero (H1) → TrustBar → "Why owning our buildings matters" (narrative +
differentiator checklist) → Neighborhoods we serve (4 cards) → Trusted partners (client strip) →
Resident reviews → CTA band.
- **Title:** `About | PropertyLink NYC`
- **Description:** "Founded in 2015, PropertyLink Management NYC is a furnished-housing provider that
  owns every building it rents. Learn about our owner-operated approach and the companies that trust us."

### Services — `/services` (consolidated; the legacy site had no single Services page)
Sections: intro hero (H1) → 3 ServiceCards (Short-Term `#short-term`, Long-Term `#long-term`,
Corporate `#corporate`) → What's included (amenities) → How it works (4 steps) → FAQ (accordion) → CTA band.
- **Title:** `Furnished Housing Services | PropertyLink NYC`
- **Description:** "Short-term furnished stays, long-term rentals, and corporate relocation housing
  across Manhattan — all in PropertyLink-owned buildings with Wi-Fi, utilities, linens, and full
  kitchens included."

### Contact — `/contact`
Two columns: **left** = working contact form; **right** = direct-contact card (address, click-to-call,
email, hours, socials) + "Prefer to call?" panel.
- **Title:** `Contact Us | PropertyLink NYC`
- **Description:** "Contact PropertyLink NYC about furnished short-term, long-term, and corporate
  housing in Manhattan. Call 888-622-0772 or send us a message — we respond within one business day."

### Recommended future SEO
- `src/app/sitemap.ts` + `src/app/robots.ts` (Next file conventions).
- `Organization` / `LocalBusiness` JSON-LD on the home/contact pages (NAP, hours, geo) — data already in `site-config.ts`.
- Per-route `opengraph-image` (file convention) for richer link previews.

---

## 4. Contact Form

The original site had a single free-text "message" field. The redesign uses a structured,
validated, accessible, spam-protected form that **persists to Postgres and emails a notification**.

### Fields & validation (`src/lib/schemas/contact.ts` — shared by client form + API)
| Field | Rules |
|-------|-------|
| Name | required, 1–100 chars |
| Email | required, valid email |
| Phone | optional, ≤30 chars |
| Interested in | select: Short-term / Long-term / Corporate / General |
| Desired move-in | optional date |
| Company | optional, ≤120 chars |
| Message | required, 10–2000 chars |
| Consent | required checkbox |
| `website` | **honeypot** (hidden; if filled → request silently dropped) |

### Flow (`POST /api/contact` → `src/app/api/contact/route.tsx`)
1. Honeypot check → if filled, return fake `200` without persisting/emailing.
2. In-memory per-IP rate limit (5 / 10 min; swap for Redis/Upstash in production).
3. Zod `safeParse` → `400` with field issues on failure.
4. **Persist** to `ContactInquiry` (Prisma) — the source of truth.
5. **Email** notification (best-effort, `try/catch`): a transient SMTP failure is logged but the
   record is kept and the request still returns `201`. If SMTP isn't configured, it's skipped with a warning.

Client UX (`src/components/contact/contact-form.tsx`): react-hook-form + zodResolver + TanStack
`useMutation`; Sonner success/error toasts; full a11y (labels, `aria-invalid`, `aria-describedby`,
`role="alert"`, keyboard-friendly).

### Data model (`prisma/schema.prisma`)
`ContactInquiry { id, name, email, phone?, inquiryType (enum), company?, moveInDate?, message, createdAt }`
with indexes on `createdAt` and `email`. Enum `InquiryType { SHORT_TERM, LONG_TERM, CORPORATE, GENERAL }`.

### Email (Nodemailer + React Email)
- Template: `src/emails/contact-notification.tsx` (branded; `replyTo` = submitter).
- Transport: `src/lib/email/mailer.ts` (SMTP via env; lazy/guarded so missing config never breaks builds).
- **Resend alternative:** keep the same React Email template and swap the transport in `mailer.ts`.

### Required environment variables
Add to `.env` (and `.env.example`). Email vars are **optional** — the app runs without them; sending
is enabled only when all are present:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/property_link   # already set
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
CONTACT_TO=info@propertylinknyc.com
CONTACT_FROM=PropertyLink NYC <info@propertylinknyc.com>
```
> Note: `.env.example` could not be edited automatically in this environment (sandbox restriction on
> dotfiles). Please add the SMTP/CONTACT keys above to `.env.example`.

---

## 5. Images & Assets

The 7 real building photos + hero were downloaded from the legacy Wix CDN into `/public/images/`.
`next.config.ts` also allowlists `static.wixstatic.com` as a fallback. Cards normalize mixed source
orientations via a 4:3 `AspectRatio` + `object-cover`.

| Asset | Local path | Used on |
|-------|-----------|---------|
| Hero (building exterior) | `/public/images/hero.jpg` | Home hero (`preload`) |
| 138 Bowery | `/public/images/properties/138-bowery.jpg` | Home properties |
| 521 West 48th St | `/public/images/properties/521-west-48.jpg` | Home properties |
| 433 West 53rd St | `/public/images/properties/433-west-53.jpg` | Home properties |
| 626 10th Avenue | `/public/images/properties/626-10th-ave.jpg` | Home properties |
| 145 Mulberry St | `/public/images/properties/145-mulberry.jpg` | Home properties |
| 165 East 89th St | `/public/images/properties/165-east-89.png` | Home properties |
| 407 West 51st St | `/public/images/properties/407-west-51.jpg` | Home properties |
| Logo / wordmark | (typographic, no image) | Header, footer |

Each `<Image>` has descriptive `alt` (e.g. "138 Bowery building exterior in Little Italy").
**To optimize:** `433-west-53.jpg` is a 5.7 MB source (next/image still serves resized WebP/AVIF, but
re-compressing the source is recommended). New sections (team, avatars) intentionally use no fake
imagery — testimonials use star ratings, not stock headshots.

---

## 6. Testimonials

The legacy site had **no on-site testimonials** despite positive third-party reviews (Yelp / Google /
Birdeye). The redesign surfaces three, paraphrased from real review themes, in
`src/lib/data/testimonials.ts`.

> ⚠️ **Pending client verification:** exact quote wording and reviewer attribution are generic
> ("Verified resident"). Before publishing, confirm real quotes/names or keep the generic attribution.

---

## 7. Service Descriptions (`src/lib/data/services.ts`)

- **Short-Term Furnished Stays** — fully furnished homes for stays of 30+ days; a comfortable,
  cost-effective alternative to extended hotels. Move-in ready, all utilities included, flexible dates.
- **Long-Term Rentals** — furnished or unfurnished homes in owner-operated buildings, responsive
  management, pet-friendly, prime transit-rich neighborhoods.
- **Corporate & Relocation Housing** — turnkey housing for teams and productions; single point of
  contact, flexible terms, consolidated billing, multiple Manhattan units.
- **Amenities (every unit):** Wi-Fi, heat & hot water, A/C, fresh linens, full kitchen, pet-friendly.

---

## 8. PDFs

**None.** The legacy site hosts no downloadable PDFs (no brochures, lease templates, or guides).
Opportunities for later: a building brochure, move-in checklist, or lease/application PDF.

---

## 9. Blog / News

**None.** The legacy site has no blog or news section. A future `/blog` can attach to the
`(marketing)` group for content-marketing SEO (neighborhood guides, relocation tips).

---

## 10. Design System

- **Typography:** Fraunces (display/headings) + Inter (body) via `next/font`; Geist Mono retained.
- **Color (oklch tokens in `globals.css`):** warm "paper" background, deep **navy** primary, **brass/gold**
  brand accent (`--brand` / `--brand-strong` for accessible small text), used sparingly. Light by
  default; a coherent dark palette is wired via `next-themes` (low priority).
- **UI:** ShadCN (base-nova / Base UI primitives). Added: navigation-menu, sheet, accordion, textarea,
  select, separator, badge, avatar, aspect-ratio, checkbox. Button extended with a `brand` variant and
  `xl` size.
- **Shared components:** `layout/` (Container, Logo, SiteHeader, SiteFooter), `sections/`
  (Section, SectionHeading), `marketing/` (Hero, TrustBar, Stat, FeatureCard, ServiceCard,
  PropertyCard, AmenityItem, TestimonialCard, LogoStrip, CtaBand), `contact/ContactForm`,
  `icons/social-icons` (Instagram/Facebook — lucide v1 dropped brand glyphs).
- **Accessibility:** skip link, semantic landmarks, labelled controls, visible focus rings,
  `prefers-reduced-motion` honored, descriptive alt text, AA-minded contrast (navy/brass on paper).

---

## 11. Open Questions / Client TODOs

1. **Building addresses:** only HQ (521 W 48th, Suite 1A) is fully specified; the other six use
   neighborhood-level locations — confirm exact addresses before a Properties page.
2. **Testimonials:** confirm real quote wording + attribution (currently generic, pending verification).
3. **Corporate logos:** "Fast Retailing, Fastly, DO&CO, DIRECTV Latin America" shown as text — confirm
   rights/assets before showing logos.
4. **FAQ facts:** pricing, deposits, and payment terms were intentionally omitted (not on the legacy
   site) — provide if you want them published.
5. **Email:** provide SMTP credentials (or a Resend key) to enable contact notifications.

---

## 12. Build, Run & Verify

```bash
docker compose up -d        # Postgres on :5434
npm run db:push             # sync schema (ContactInquiry)
npm run dev                 # http://localhost:3000
npm run build && npm start  # production build (verified passing)
npm run lint                # eslint (verified clean)
npm run db:studio           # inspect ContactInquiry rows
npm run db:seed             # optional sample inquiries
```
Verified in this phase: production build passes; all four pages return 200 with correct SEO titles;
contact API returns 201 + persists on valid input, 400 with field issues on invalid input, and
silently drops honeypot submissions (no DB row); email is skipped-with-warning when SMTP is unset
while the inquiry still persists. Recommended manual pass: visual/responsive check at 360/768/1280px
and an axe accessibility audit in the browser.
