# Setup checklist (accounts and infrastructure)

The code for every phase is in this repository. These are the steps that need someone with
the agency's accounts. Each ends with the "done when" check from `cms-plan/10-phases.md`.

## Phase 0

- [ ] **GitHub**: create `DRPBuildLab/tnl-website`, push this repository.
  Settings → Branches → protect `main`, require the `ci` status check.
  *Done when a failing check blocks the merge.*
- [ ] **Neon**: new project on the Free plan, region `aws-eu-central-1`. Rename the default
  branch `main`; create child branch `dev`. On both: autoscaling max 0.25 CU. Settings → turn on
  usage e-mails. Roles → create `tnl_app`, `tnl_build`, `tnl_backup`.
  ```sh
  DATABASE_URL_OWNER=<owner url, dev> npm run db:migrate
  psql "<owner url, dev>" -f scripts/sql/roles.sql
  psql "<tnl_build url>" -v ON_ERROR_STOP=0 -f scripts/sql/check-roles.sql   # INSERT must fail
  psql "<tnl_backup url>" -v ON_ERROR_STOP=0 -f scripts/sql/check-roles.sql  # INSERT must fail
  psql "<tnl_app url>"   -f scripts/sql/check-roles.sql                      # INSERT succeeds
  ```
  Repeat migrate + roles on `main`. *Done when all three roles connect and two are refused.*
- [ ] **Neon Object Storage**: create the private bucket `media`; create two credentials:
  read/write (`storage:read` + `storage:write`) and read-only (`storage:read`).
  `npm run storage:smoke`. *Done when it prints three ✓.*
- [ ] **Seed** (dev, then main): `npm run db:seed`, then
  `ADMIN_EMAIL=grouptnl@outlook.com npm run seed:account -- --name "TNL Group"`.
- [ ] **Cloudflare Worker** `tnl-website` (existing Workers Paid account): Workers & Pages →
  Create → Import a repository → `tnl-website`.
  - Build command: `npm ci && npm run build` · Deploy command: `npm run deploy`
  - Non-production branches: on (preview URL per pull request). Previews are versions of the
    same Worker with the same secrets, so the code switches to `<NAME>_PREVIEW` on any branch
    other than `main`: set `DATABASE_URL_BUILD_PREVIEW` (build) and `DATABASE_URL_PREVIEW`
    (Worker) to the `dev` branch, plus `STORAGE_*_PREVIEW` if the dev branch has its own bucket
    endpoint. A preview build without `DATABASE_URL_BUILD_PREVIEW` refuses to run.
  - Build variables and secrets (Settings → Build): `DATABASE_URL_BUILD`, `STORAGE_ENDPOINT`,
    `STORAGE_BUCKET`, `STORAGE_READ_KEY_ID`, `STORAGE_READ_SECRET`, `PUBLIC_SITE_URL`,
    `TURNSTILE_SITE_KEY`.
  - Worker variables and secrets (Settings → Variables and Secrets): `DATABASE_URL`,
    `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY`,
    `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `ADMIN_GATE_USER`, `ADMIN_GATE_PASSWORD`,
    `BREVO_API_KEY`, `DEPLOY_HOOK_URL`, `BUILD_LOG_URL`, `TURNSTILE_SECRET`, `CRON_SECRET`
    (`STORAGE_BUCKET`, `MAIL_*` are in `wrangler.jsonc`).
  - Settings → Builds → Deploy hooks → create one for branch `main`; its URL is `DEPLOY_HOOK_URL`.
  *Done when a push to `main` deploys to `tnl-website.<account>.workers.dev` and a pull request
  gets a preview URL.*
- [ ] **R2**: buckets `tnl-backups` (Settings → Object lifecycle: delete after 30 days) and
  `tnl-media-mirror`. An API token limited to those two buckets.
  GitHub → Settings → Secrets: `BACKUP_DATABASE_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
  `R2_SECRET_ACCESS_KEY`, `NEON_STORAGE_READ_KEY_ID`, `NEON_STORAGE_READ_SECRET`; Variables:
  `NEON_STORAGE_ENDPOINT`. Run both workflows by hand (Actions → Run workflow).
  *Done when a dump and a copy of the test file are in R2.*
- [ ] **Brevo**: Senders & domains → add `tnlgroup.be`, send TNL the DKIM and verification
  records for GoDaddy (the domain has DMARC `quarantine`, so unsigned mail would be quarantined).
  *Done when Brevo shows the domain authenticated.* Waits on TNL.
- [ ] **Turnstile**: add a widget for the `*.workers.dev` host (and later `tnlgroup.be`),
  mode **Invisible**; site key → `TURNSTILE_SITE_KEY`, secret → `TURNSTILE_SECRET`.

## Phase 5–6 checks on the real stack

- [ ] Publish cycle: edit, save, **Publiceren**, **Live**. Measure the build time and tell TNL.
  Force a failing build (for example a temporary broken `verify-build`) and see **Mislukt**.
- [ ] `/api/submit` with Neon stopped (Neon console → suspend compute on a preview branch):
  the notification still arrives.
- [ ] `npm run e2e:admin` and `npm run e2e:responsive` against the preview, Lighthouse mobile on
  `/`, one service page and one project page, securityheaders.com on the preview.
- [ ] Restore rehearsal (see HANDOVER.md) and fill in the table there.
