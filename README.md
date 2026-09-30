# tnl-website

The website and CMS of TNL Group (tnlgroup.be): one SvelteKit app on Cloudflare Workers.
The public site is prerendered from Neon at build time; the CMS lives at `/admin` on the same
domain. The build plan is in [`docs/cms-plan/`](docs/cms-plan/README.md); how to run it day to
day (publish, reset the password, restore a backup) is in [`HANDOVER.md`](HANDOVER.md).

| | |
| --- | --- |
| Framework | SvelteKit 2 + Svelte 5 + TypeScript (strict) |
| Hosting | Cloudflare Workers with static assets, built by Workers Builds (`wrangler.jsonc`) |
| Database | Neon Postgres through Drizzle ORM (`src/lib/server/db/schema.ts`, migrations in `drizzle/`) |
| Media | Neon Object Storage (S3 API) behind `src/lib/server/storage.ts`; WebP variants at build |
| Auth | Better Auth: e-mail + password + 6-digit code by e-mail, behind an HTTP Basic gate |
| Mail | Brevo (`src/lib/server/mail.ts`) |
| Design | TNL Group design system v2, ported one to one (`src/lib/components`, `src/lib/styles`) |

## Getting started

```sh
npm ci
cp .env.example .dev.vars && cp .env.example .env   # fill in the dev branch values
npm run db:migrate      # as the owner role (DATABASE_URL_OWNER)
npm run db:seed         # TNL's launch content and photos (idempotent)
ADMIN_EMAIL=you@drpbuildlab.com npm run seed:account
npm run dev             # http://localhost:5173, CMS at /admin
```

Without Neon credentials everything still builds: `build-content` falls back to
`scripts/seed.json`, and a local Postgres works for `npm run dev` (any non-Neon
`DATABASE_URL` uses node-postgres). With no `STORAGE_ENDPOINT`, photos go to `.local-bucket/`,
and with no `BREVO_API_KEY` the login code is printed in the terminal.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server (public site + CMS) |
| `npm run build` | `build-content` → `build-images` → `build-enhance` → `vite build` → `add-scheduled` → `verify-build` |
| `npm run deploy` | `wrangler deploy` then `mark-live` (the Workers Builds deploy command) |
| `npm run check` / `npm run lint` / `npm test` | svelte-check, ESLint, Vitest (DB tests run when `TEST_DATABASE_URL` is set) |
| `npm run e2e:admin` | CMS end to end with Playwright (throwaway rows only) |
| `npm run e2e:responsive` | 320–1440 px overflow, tap targets, nav, axe-core |
| `npm run db:generate` / `db:migrate` / `db:seed` | Drizzle migrations and the seed |
| `npm run seed:account` | Create the CMS account, or `-- --reset` its password |
| `npm run export-seed` | Regenerate `scripts/seed.json` from `scripts/seed-data.ts` |
| `npm run storage:smoke` | Phase 0 bucket check (read/write vs read-only credential) |
| `npm run send-invite -- gate` / `-- login` | Send TNL their access, gate first |

## How the pieces fit

- **Public pages** (`src/routes/(public)`) are prerendered with `csr = false`: plain HTML and
  CSS, plus one 3 kB script (`src/lib/enhance/site.ts`) that applies the same Svelte actions
  the components use (tabs, before/after slider, mobile menu, contact form).
- **Views** (`src/lib/views`) render each page from a `SiteContent` object. The build passes
  published content; the CMS preview (`/admin/preview/...`) passes the saved drafts.
- **Build-time content**: `scripts/build-content.ts` reads Neon with the read-only role and
  writes `src/lib/generated/*.json`, `_redirects` and `static/build-info.json`.
- **Worker routes**: `/admin/*` (CMS, behind the gate and the login), `/api/submit` (contact
  form), `/api/cron` (daily sweep; called by the cron handler that `add-scheduled` appends).
- **Media rule**: a file no row uses any more is deleted from the bucket
  (`src/lib/server/cms/media-service.ts`).

## Conventions

TypeScript strict; `npm run check` and `npm run lint` must pass before merge. Components are
ported from `design-system-v2/components/*/preview.html` one to one; a visual change goes
into the design system first (`src/lib/styles/layout.css` lists the few "upstream" candidates).
Database columns are English `snake_case`; everything the client sees is Dutch.
Conventional Commits; `main` deploys production, pull requests get preview builds.
