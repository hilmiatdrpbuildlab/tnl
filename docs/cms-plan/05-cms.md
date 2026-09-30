# CMS at /admin

The CMS is reached by a direct link, `https://<site>/admin`, on the same domain as the site, as in One Man Agency. There is no link to it anywhere on the public site, and `/admin` is `noindex` and disallowed in `robots.txt`.

## Getting in

1. **HTTP Basic gate.** `hooks.server.ts` checks `ADMIN_GATE_USER` / `ADMIN_GATE_PASSWORD` before anything else. An anonymous request gets a plain-text 401 with no branding. This is the fix One Man Agency needed after Google Safe Browsing flagged its branded login form on a `*.vercel.app` URL as phishing; a `*.workers.dev` URL carries the same risk.
2. **E-mail + password.** [Better Auth](https://www.better-auth.com/docs/plugins/2fa) with public sign-up disabled. The one account is created by `scripts/seed-account.ts`, which also resets a forgotten password.
3. **One-time code by e-mail.** Better Auth's two-factor plugin with `sendOTP` sending a 6-digit code through Brevo. The code is valid for 5 minutes (the plugin's OTP options), with a *Code opnieuw sturen* link that appears after 60 seconds. A device is trusted for 30 days, so the client types a code about once a month per device. Keep the plugin's lockout after repeated wrong codes, which is on by default. Sessions are stored in Neon, in an `HttpOnly`, `Secure`, `SameSite=Lax` cookie scoped to `/admin`.

## Screens (labels in Dutch, as the client sees them)

| Screen | What the client does there |
| --- | --- |
| Overzicht | Sees unpublished changes, last publish status, unread messages and content gaps (missing alt text, SEO text too long, reviews without consent) |
| Pagina's | Edits the fixed pages: home (hero statement, intro), over ons, contact, and the intros of the index pages |
| Diensten | Edits each service: title, summary, sub-services (repeatable rows), photo, tile colour, body, SEO |
| Projecten | Adds, edits, orders and deletes projects: service, photos, optional before/after pair, gallery, featured flag |
| Reviews | Adds reviews with a required "Klant gaf toestemming" checkbox before publishing |
| FAQ | Adds and orders questions, generally or per service |
| Cijfers | Edits the stat figures (max 3 shown) |
| Blog | Writes posts in a Markdown editor with preview, cover image, category, date, SEO |
| Media | Browses all files with their usages; replaces or deletes unused files |
| Berichten | Reads contact-form messages, marks them read, deletes them, exports them as CSV. Messages older than 12 months are deleted automatically, and the screen says so |
| SEO & redirects | Checks titles and descriptions per page; manages redirects |
| Instellingen | Company details, socials, the address that receives form notifications |
| Account | Changes the password, signs out |

## Behaviour that applies everywhere

- **Save is not publish.** Saving writes to Neon only. A banner on every screen says how many changes are not yet live, with a **Publiceren** button (see [Build, publish and deploy](07-build-and-deploy.md)).
- **Preview** renders the page with the draft data, using the real public components, before anything is published.
- **Deleting asks first**, in a dialog that names the item. One Man Agency had a defect where deleting skipped its own confirmation; add an end-to-end test for it.
- **Counted fields** show characters left against the 62 / 158 limits.
- The CMS UI uses the TNL tokens and `admin.css`, ported from One Man Agency's editors. It does not need the public site's visual polish.
