# Environments and secrets

There are three environments, each with its own Neon branch, so no test ever touches the client's content.

| Environment | Code | Neon branch | URL |
| --- | --- | --- | --- |
| Local | any branch, `npm run dev` | `dev` (a child of `main`) | `localhost:5173` |
| Preview | pull requests (Workers Builds) | `dev` (shared: Neon Free allows 10 branches) | preview URL per build, optionally behind Cloudflare Access |
| Production | `main` | `main` | `tnl-website.<account>.workers.dev` until the domain move |

Plans: Neon Free and the existing Cloudflare Workers Paid plan. On Neon, cap autoscaling at 0.25 CU on every branch and turn on the usage e-mails; the Free plan allows 100 CU-hours a month per project, and running out suspends the database (the static site stays up).

Locally, values live in `.dev.vars` (git-ignored, with an `.env.example` committed). In Cloudflare, a secret is set with `wrangler secret put` or in the dashboard, and a build variable under Settings, Builds.

| Variable | Used by | Kind | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | Worker | secret | `tnl_app` role, pooled connection string |
| `DATABASE_URL_BUILD` | build | build secret | `tnl_build` read-only role |
| `STORAGE_ENDPOINT`, `STORAGE_BUCKET` | Worker, build | variable | Neon Object Storage endpoint; bucket `media` |
| `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY` | Worker | secret | Neon credential with `storage:read` + `storage:write` |
| `STORAGE_READ_KEY_ID`, `STORAGE_READ_SECRET` | build | build secret | A second credential with `storage:read` only |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | Worker | secret / variable | 32+ random bytes; the site URL |
| `ADMIN_GATE_USER`, `ADMIN_GATE_PASSWORD` | Worker | secret | Empty in local development = gate off |
| `BREVO_API_KEY`, `MAIL_FROM`, `MAIL_FROM_NAME` | Worker | secret / variable | `MAIL_FROM` = `noreply@tnlgroup.be`, domain authenticated in Brevo |
| `MAIL_REPLY_TO` | Worker | variable | `grouptnl@outlook.com` (login mail; form notifications reply to the customer) |
| `DEPLOY_HOOK_URL` | Worker | secret | Anyone holding it can start builds |
| `PUBLIC_SITE_URL` | build | variable | Canonical URLs and JSON-LD |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET` | build, Worker | variable / secret | Invisible "managed" widget |
| `SUBMIT_LIMITER` | Worker | rate-limit binding | 5 requests per IP per 600 s, in `wrangler.jsonc` |
| `BACKUP_DATABASE_URL` | GitHub Actions | repository secret | `tnl_backup` role (read-only, all tables), for `db-backup.yml` |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` | GitHub Actions | repository secrets | R2 token limited to `tnl-backups` and `tnl-media-mirror` |
| `NEON_STORAGE_READ_KEY_ID`, `NEON_STORAGE_READ_SECRET` | GitHub Actions | repository secrets | Read-only storage credential, for `media-mirror.yml` |
| `ADMIN_EMAIL` | `seed-account` script only | local | Never deployed |

The gate credentials and the CMS login go to the client separately, the gate first. One Man Agency's `send_invite` script is the model for doing this by e-mail.
