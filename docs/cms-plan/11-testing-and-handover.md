# Testing and handover

The site is ready to hand over when every check below passes on the production `*.workers.dev` URL.

| Check | Tool | Pass when |
| --- | --- | --- |
| Unit tests | Vitest | Media usage and deletion logic, slug to redirect, form validation and SEO length rules are covered and green |
| Build verification | `scripts/verify-build.ts` | Every route exists, titles are 62 characters or fewer, descriptions 158 or fewer, JSON-LD parses, sitemap lists every published slug, no unpublished row appears |
| CMS end to end | Playwright (`scripts/e2e-admin.ts`, modelled on One Man Agency's `admin-e2e.mjs`) | Sign-in with code, edit, preview, publish, delete with confirmation, image replace deletes the old object; runs against a preview, using throwaway rows only |
| Responsive | Playwright at 320, 375, 430, 768, 1024, 1440 px (One Man Agency's `responsive.mjs`) | No horizontal overflow, tap targets at least 24 × 24 px, nav collapses under 980 px |
| Accessibility | axe-core in Playwright | No serious or critical issues on any public page or CMS screen |
| Performance | Lighthouse, mobile | Performance 90+, Accessibility 100, SEO 100, and LCP under 2.5 s, on `/`, one service page and one project page |
| Backups | Manual | Last night's dump is in `tnl-backups`, this week's mirror is in `tnl-media-mirror`, and the restore rehearsal passed |
| Security | securityheaders.com, manual | Grade A; `/admin` answers 401 without the gate; no secret appears in the client bundle (`grep` on the build output) |

## Handover to TNL

- The gate credentials and the CMS login, sent separately.
- A short Dutch guide in the CMS (on the Overzicht screen): saving versus publishing, adding a project with a before/after pair, where messages arrive.
- For DRP BuildLab: `README.md`, `HANDOVER.md`, and access to GitHub, Cloudflare, Neon and Brevo held by the agency, not by one developer.
