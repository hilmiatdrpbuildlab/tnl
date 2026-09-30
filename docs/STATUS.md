# Build status

30 September 2026. Every phase in [`cms-plan/10-phases.md`](cms-plan/10-phases.md) is built in
code and checked locally (Postgres 16, a local folder standing in for the bucket, `wrangler dev`).
What still needs the agency's accounts is listed in [`SETUP.md`](SETUP.md).

## Phases

| Task | Code | Checked here | Needs accounts |
| --- | --- | --- | --- |
| **0** SvelteKit + adapter-cloudflare app | ✓ | `check`, `lint`, `build` pass on a clean clone | |
| **0** Neon project, branches, three roles | `scripts/sql/roles.sql`, `check-roles.sql` | Roles connect; `tnl_build` and `tnl_backup` refused an INSERT | Create in Neon |
| **0** `media` bucket, two credentials | `storage.ts`, `npm run storage:smoke` | Against the local folder | Create in Neon |
| **0** Worker, Workers Builds, secrets | `wrangler.jsonc`, `npm run deploy` | `wrangler deploy --dry-run` (864 KiB gzip) | Connect in Cloudflare |
| **0** CI on pull requests | `.github/workflows/ci.yml` | Same steps run locally | Branch protection |
| **0** R2 buckets, backup + mirror workflows | `db-backup.yml`, `media-mirror.yml` | | Create in Cloudflare, add secrets |
| **0** Brevo domain authentication | `mail.ts` | Dev mode prints mails | DNS at GoDaddy (TNL) |
| **1** Tokens, `tnl.css`, fonts | copied unchanged | Pages render in Geist on paper | |
| **1** 18 components in Svelte | `src/lib/components` | `/dev/components` at 1440 and 390 px | |
| **1** `tnl.js` → Svelte actions | `src/lib/actions` | Arrow keys on tabs and slider, Escape closes the menu | |
| **1** Logo and Lucide icons as components | `Logo.svelte`, `Icon.svelte` | No icon through `<img>` | |
| **2** Drizzle schema, first migration | 14 tables + Better Auth, `drizzle/` | Applies cleanly to an empty database | |
| **2** Better Auth tables | same migration history | ✓ | |
| **2** `seed-content.ts` | real TNL content, 7 photos | Run twice: same rows, no duplicates | |
| **2** `content.ts` + `seed.json` fallback | `build-content.ts` | Builds with and without `DATABASE_URL_BUILD` | |
| **3** Every public route, prerendered | `src/routes/(public)` | Static HTML for every route; Worker not invoked | |
| **3** WebP variants and `srcset` | `build-images.ts` | Nothing over 2400 px; every `<img>` has width, height, alt | |
| **3** SEO, JSON-LD, sitemap, robots, `_redirects` | `seo.ts`, `schema-org.ts` | `verify-build` asserts lengths and JSON-LD; `/services-4` answers 301 | |
| **3** `/api/submit` | honeypot, Turnstile, limits, mail first | No-JS form → `/bedankt`; 6th in 10 min refused; DB unreachable → mail still sent | Turnstile keys |
| **4** Gate, login, code, lockout, `seed-account` | `hooks.server.ts`, `auth-config.ts` | Bare 401; wrong code refused; the 10th wrong code locks the account (15 min); `--reset` clears it | |
| **4** Layout, Overzicht, Account | ✓ | Counts match the database | |
| **4** Editors with preview | Pagina's, Diensten, Projecten, Reviews, FAQ, Cijfers, Blog | Every field editable; preview uses the public views | |
| **4** Media library, upload, deletion rules | `media-service.ts` | Replace deletes the old object; used file cannot be deleted; sweep after 24 h | |
| **4** Berichten, Instellingen, SEO & redirects | ✓ | CSV export; slug change writes a 301 | Phone change on every page after publish: on the real stack |
| **5** Publish pipeline | `/admin/api/publish`, `build-info.json`, `mark-live`, banner | Double click starts one build; Live only after `build-info.json` changes | Real build and *Mislukt* on Workers Builds |
| **6** `_headers`, CSP hash mode, retention cron, CSV | ✓ | No CSP violations on any page or CMS screen | securityheaders.com on the preview |
| **6** Restore rehearsal | `HANDOVER.md` | | Needs R2 and Neon |
| **6** Testing and handover checks | Vitest, `e2e-admin.ts`, `responsive.ts` | 33 unit/DB tests; CMS e2e 12/12; responsive + axe clean | Run on the `*.workers.dev` URL |
| **6** `README.md`, `HANDOVER.md` | ✓ | | Someone else to try them |

## Where the code differs from the plan

| Plan | Here | Why |
| --- | --- | --- |
| `/api/publish` | `/admin/api/publish` | The session cookie is scoped to `/admin`, so `/api/*` never sees it. |
| Rate-limit binding, 5 per 600 s | Binding 5 per 60 s **plus** a 10-minute window in the Cache API | The binding only supports 10 s or 60 s periods. |
| Prerender reads Neon | `build-content.ts` reads Neon (read-only role) before `vite build` and writes JSON the prerender uses | Same role and data; no database driver or secret inside the prerender, and `build-images` needs the same list. |
| `main` = `_worker.js` | Same, plus `add-scheduled.ts` appends the cron handler | The adapter only exports `fetch`. |
| WebP 480/960/1600/2400 | 480/**720**/960/1600/2400, quality 62 | Phones at about 1.75× pick 720 instead of 960 (mobile LCP). |
| `tnl.js` → Svelte actions | Same actions; public pages use `csr = false` and a 3 kB script that applies them | Hydration JavaScript cost about 10 Lighthouse points on mobile. |
| Transactions on save | `db.batch([...])` on neon-http | neon-http has no interactive transactions; a batch is one transaction. |
| — | `media.unused_since`, `settings.pending_deletions` | The 24-hour sweep, and counting deletions in the banner. |
| — | `layout.css` | Grids and spacing between components; a few "upstream" fixes listed there. |

## Design-system findings (fix upstream in `design-system-v2`)

- `[1]` pillar index in an Olive section: `highlight` on `olive-600` at 14 px is 3.9:1 (AA needs
  4.5:1). Overridden to `ink-soft` in `layout.css`.
- Text links (`tnl-textlink`, contact rows, header phone, footer) are under 24 px tall;
  `layout.css` sets a 24 px minimum.
- The interior Hero (about 480 px), running text (`l-prose`) and the project gallery have no
  classes in `tnl.css` yet.

## Measured here (local `wrangler dev`, Lighthouse 12 mobile)

| Page | Performance | Accessibility | Best practices | LCP |
| --- | --- | --- | --- | --- |
| `/` | 90 | 100 | 100 | 3.6 s |
| `/diensten/aanleg` | 88–96 | 100 | 100 | 2.7–3.9 s |
| `/projecten/tuinrenovatie-grind-en-gazon` | 84 | 100 | 100 | 4.5 s |

SEO scores 69 here only because the test build is `noindex` on purpose (the plan's own rule for
`*.workers.dev`); with `SITE_NOINDEX=0` nothing else is flagged. The LCP target of 2.5 s is not
met yet: the hero photos are dense foliage (about 130 kB at 720 px). Re-measure on the
Cloudflare edge; if it still misses, the options are a lighter hero crop from TNL or a lower
WebP quality for hero images only.

## Still open (needs TNL)

Unchanged from [`cms-plan/12-open-items.md`](cms-plan/12-open-items.md): GoDaddy DNS for Brevo,
the company number (the footer hides it and `verify-build` warns while it is empty), the Facebook
page URL (the share link is in the seed), the optional phone field, approval of the privacy
text (a draft is in the contact page), the retention period, and real project details and
reviews (the seed only describes what the photos show; no reviews are seeded).
