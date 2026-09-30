# Public site

Every public route is prerendered (`export const prerender = true` on the `(public)` group) from published rows only. The pages are built from the design-system components; nothing is styled from scratch.

| Route | Content from | Components, in page order |
| --- | --- | --- |
| `/` | `pages[home]`, services, featured projects, stats, reviews, general FAQs | Hero, ServiceTiles, BeforeAfter (first featured project with a pair), Stats, ProjectCard ×3, Testimonial, FAQ, ContactSection, Footer |
| `/diensten` | `pages[diensten]`, services | SectionHeader, ServiceTabs, Pillars, ContactSection |
| `/diensten/[slug]` | one service, its projects and FAQs | Hero (interior, 480 px), plus-list and Chips, ProjectCard grid, FAQ, ContactSection |
| `/projecten` | `pages[projecten]`, projects | SectionHeader, ProjectCard (stacked) grid, grouped by service |
| `/projecten/[slug]` | one project | Hero (interior), BeforeAfter, photo gallery, body, related projects |
| `/over-ons` | `pages[over-ons]`, stats, reviews | Hero (interior), Pillars, Stats, Testimonial |
| `/contact` | `pages[contact]`, settings | ContactSection, FAQ |
| `/blog`, `/blog/[slug]` | posts | SectionHeader, BlogCard grid; article layout |
| `/bedankt`, `/formulier-fout` | fixed | Fallback pages for the form without JavaScript |
| `/404` | fixed | SectionHeader, links to the four main pages |
| `/sitemap.xml`, `/robots.txt` | all published slugs | Generated at build |

## Rules

- The blog link appears in the header and footer only when at least one post is published.
- Contact details, socials and the company number come from `settings` everywhere, never typed into a page.
- The contact form posts to `/api/submit` (a Worker route, not prerendered). Fields: Voornaam, Email and Uw bericht required; Achternaam and Onderwerp optional (an optional *Telefoon* field is still to be confirmed with TNL). The route runs in this order:
    1. Reject the request if the honeypot is filled, the Turnstile token fails, or the rate limit is hit (5 submissions per IP per 10 minutes, Cloudflare rate-limit binding).
    2. Validate with Zod.
    3. **Send the Brevo notification first**, to `settings.notify_email` (`grouptnl@outlook.com`), from `noreply@tnlgroup.be`, with Reply-To set to the customer's e-mail.
    4. Write the `submissions` row, with `notified_at` set if the mail went out. If Neon is waking up or over its Free quota and the write fails, the message has still reached TNL by e-mail; log the failure.
    5. Return the thank-you state, or redirect to `/bedankt` without JavaScript. Show `/formulier-fout` only if both the mail and the write failed.
- Turnstile runs in invisible "managed" mode, so most visitors never see a challenge.
- `js/tnl.js` from the design system is replaced by small Svelte actions for tabs, the before/after slider and the mobile menu, with the same behaviour and keyboard support.

## SEO

- `<title>`, meta description, canonical URL (`PUBLIC_SITE_URL` + path) and Open Graph image on every page.
- JSON-LD: `HomeAndConstructionBusiness` with address and phone on every page, `Service` per service page, `FAQPage` wherever FAQs show, `BlogPosting` per post, `BreadcrumbList` on detail pages.
- `redirects` rows become Cloudflare `_redirects` entries at build. Seed them with the old Wix paths (`/services-4` → `/diensten`, `/projects-8` → `/projecten`) so they are ready for the domain move later.
- Until the domain move, the `*.workers.dev` build sends `noindex` and a `robots.txt` that blocks all crawlers, so the test site is never indexed.
