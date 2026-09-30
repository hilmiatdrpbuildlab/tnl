# Repository layout

One GitHub repository, `tnl-website`, mirrors the One Man Agency layout so the team can move code across. Route groups keep the prerendered site and the dynamic CMS apart.

```
src/
  app.d.ts                 Platform bindings and Locals (session, user)
  hooks.server.ts          Basic gate for /admin, then session lookup
  lib/
    styles/                tokens.css, tnl.css copied from design-system-v2 (never edited here)
    components/            Public blocks: Header, Hero, ServiceTiles, ProjectCard, BeforeAfter, FAQ, ContactSection, Footer …
    components/admin/      CMS editors: ImageField, MediaPicker, RepeatRows, CountedField, SeoPanel, PublishBanner, ConfirmDialog
    server/
      db/schema.ts         Drizzle schema (source of the migrations)
      db/client.ts         Neon HTTP client per request
      content.ts           Build-time reads for the public site
      storage.ts           Neon Object Storage client (S3 SDK)
      media.ts             Upload, variants, reference check, delete
      auth.ts              Better Auth: e-mail + password + e-mail OTP second factor
      gate.ts              HTTP Basic gate
      mail.ts              Brevo transport
      publish.ts           Deploy hook call + build status
    seo.ts, schema-org.ts  Meta tags and JSON-LD
  routes/
    (public)/              Prerendered: /, /diensten, /diensten/[slug], /projecten, /projecten/[slug], /over-ons, /contact, /blog, /blog/[slug], sitemap.xml, robots.txt
    admin/                 The CMS. Never prerendered; login required
    api/submit/            Contact form POST
    api/publish/           Publish button (server only)
.github/workflows/
  ci.yml                   check, lint, unit tests on every pull request
  db-backup.yml            Nightly pg_dump to R2 (02:30)
  media-mirror.yml         Weekly rclone copy of the media bucket to R2 (Sunday 04:00)
drizzle/                   Generated SQL migrations, committed
scripts/                   seed-account.ts, seed-content.ts, verify-build.ts, e2e-admin.ts
static/                    favicon, robots fallbacks
wrangler.jsonc
```

## Conventions

- TypeScript `strict`. `npm run check` (svelte-check) and `npm run lint` must pass before merge.
- Components are ported from `design-system-v2/components/*/preview.html` one to one. The class names (`tnl-btn`, `tnl-tile` …) and the tokens stay as they are. A visual change goes into the design system first.
- Database column names are English `snake_case`. Everything the client sees in the CMS is Dutch.
- Branches: `main` deploys production; each pull request gets a preview build. Commits follow Conventional Commits.
