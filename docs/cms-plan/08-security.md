# Security and privacy

The public site has no attack surface beyond two POST routes. The CMS is protected in layers: the Basic gate, a password, a one-time code, and a server-side session check on every `/admin` load and action.

- **Server-only secrets.** The database URLs, storage keys, the deploy hook, the Brevo key and the gate password are Worker secrets or build variables. None is imported into client code; use `$env/static/private` and `$env/dynamic/private` only.
- **Three database roles.** `tnl_app` (read/write, used by the Worker), `tnl_build` (read-only on content tables, used by the prerender) and `tnl_backup` (read-only on every table, used only by the nightly dump). None is the Neon owner role.
- **Every CMS mutation re-checks the session** in its form action or endpoint, not only in the layout. SvelteKit's built-in origin check stays on against CSRF.
- **Uploads:** type sniffed from the file's bytes, not the file name; size capped; object keys are server-generated UUIDs; SVG uploads are not accepted.
- **Markdown** in bodies is rendered at build time and sanitised (no raw HTML, links get `rel="noopener"`).
- **Contact form:** Zod validation, length caps, honeypot, Turnstile (invisible "managed" mode), and the Cloudflare rate-limit binding at 5 submissions per IP per 10 minutes. The notification e-mail contains the message text but never raw HTML.
- **Headers** in `_headers`, for every path:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains` (no `preload` until the real domain is live)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- **CSP** through SvelteKit's `kit.csp` in `hash` mode, not in `_headers`. Prerendered pages contain inline hydration scripts; SvelteKit hashes them into a `<meta>` CSP for prerendered pages and a header for Worker responses. Directives: `default-src 'self'`; `script-src 'self' https://challenges.cloudflare.com`; `frame-src https://challenges.cloudflare.com`; `img-src 'self' data: blob:`; `style-src 'self' 'unsafe-inline'`; `font-src 'self'`; `connect-src 'self'`; `form-action 'self'`; `base-uri 'self'`. `frame-ancestors 'none'` goes in the `_headers` file, because a `<meta>` CSP cannot set it.
- **Privacy (GDPR):** submissions hold personal data. Store only the form fields and the time, with no IP address in the table. The daily cron deletes messages older than 12 months; Berichten offers a CSV export first. Add a privacy notice to the contact page, drafted by the team and approved by TNL.
- **Backups.** Neon Free keeps only 6 hours of point-in-time restore and one manual snapshot, so there is a second layer:
  - A scheduled GitHub Action (`.github/workflows/db-backup.yml`, nightly at 02:30) runs `pg_dump` with the `tnl_backup` role, gzips the dump, and uploads it to the R2 bucket `tnl-backups`. An R2 lifecycle rule deletes dumps after 30 days.
  - The one free Neon snapshot is taken right before every production migration and replaced at the next one.
  - Photos are covered by the weekly bucket mirror (see [Media](04-media.md)).
  - `HANDOVER.md` describes a restore, and it is rehearsed once on the `dev` branch in phase 6.
