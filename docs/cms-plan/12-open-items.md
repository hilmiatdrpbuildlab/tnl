# Decisions and open items

The proposals in this plan were approved on 30 September 2026 and are recorded below as decisions. What is still open is at the end: items that need an answer from TNL.

## Decided

| Item | Decision | Applies from |
| --- | --- | --- |
| Repo and Worker name | `tnl-website` | Phase 0 |
| Plans and cost | [Neon Free](https://neon.com/pricing) + the existing Cloudflare Workers Paid plan, so no new cost. Neon autoscaling capped at 0.25 CU; Neon usage e-mails turned on | Phase 0 |
| Object Storage in beta | Accepted. Safety net: a weekly copy of the `media` bucket to Cloudflare R2 (see [Media](04-media.md)) | Phase 0 |
| Backups | Nightly `pg_dump` to R2 with 30-day retention; the one free Neon snapshot is taken before every production migration (see [Security](08-security.md)) | Phase 0 |
| Neon branches | Previews share the `dev` branch; no branch per pull request (Free allows 10 branches) | Phase 0 |
| Hiding the test site | `noindex` and a blocking `robots.txt` on `*.workers.dev`. Preview URLs optionally behind Cloudflare Access | Phase 3 |
| Spam protection | Honeypot + Turnstile in invisible "managed" mode + rate-limit binding at 5 submissions per IP per 10 minutes | Phase 3 |
| Contact form reliability | The Brevo notification is sent before the row is written, so a sleeping or over-quota Neon never loses a message | Phase 3 |
| Required form fields | Voornaam, Email and Uw bericht required; Achternaam and Onderwerp optional | Phase 3 |
| Upload rules | Up to 10 MB accepted before scaling; scaled to 2400 px in the browser; JPEG, PNG, WebP only; no SVG; a clear Dutch error for anything refused (HEIC from a desktop, for example) | Phase 4 |
| Login code | 6 digits, valid 5 minutes, "resend" after 60 seconds, device trusted for 30 days | Phase 4 |
| Submission retention | 12 months, then deleted by the daily cron; CSV export in Berichten | Phase 6 |
| Security headers | HSTS (no preload until the real domain), `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'none'`; CSP through SvelteKit `kit.csp` in `hash` mode (see [Security](08-security.md)) | Phase 6 |
| Quality targets | Lighthouse mobile 90 / 100 / 100 (performance / accessibility / SEO) and LCP under 2.5 s | Phase 6 |
| Sender address | `noreply@tnlgroup.be` through Brevo with DKIM at GoDaddy. Reply-To `grouptnl@outlook.com` on login mail and the customer's e-mail on form notifications | Phase 3 |
| Notification recipient | `grouptnl@outlook.com` | Phase 3 |
| Instagram | `https://www.instagram.com/grouptnl` | Phase 2 |

## Still open (needs TNL)

- [ ] **DNS access at GoDaddy**, or someone at TNL to add Brevo's DKIM and verification records for `tnlgroup.be`. Needed by phase 3. `tnlgroup.be` already has a DMARC policy of `quarantine`, so mail from an unsigned sender on it would be quarantined.
- [ ] **Company number.** The team looks it up in the public KBO register (kbopub.economie.fgov.be), and TNL confirms it. Needed by phase 2.
- [ ] **Facebook page URL.** The current site links to a share link, `https://www.facebook.com/share/19JzXtyX3a/`, which we use until TNL gives the page address. Needed by phase 2.
- [ ] **Phone field.** Ask TNL whether the contact form should get an optional *Telefoon* field (garden customers often prefer a callback). Needed by phase 3.
- [ ] **Privacy notice.** The team drafts a short Dutch notice (what is collected, why, 12-month retention, contact); TNL approves it. Needed by phase 3.
- [ ] **Retention.** TNL confirms that 12 months fits their own obligations. Needed by phase 6.
- [ ] **Real content** through one checklist sent to TNL: reviews with the customers' permission (their Google Business Profile, if they have one), project details per photo set, figures they can back up, and whether they will write blog posts. Needed by phase 2.
