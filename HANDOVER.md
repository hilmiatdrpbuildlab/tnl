# Handover

For DRP BuildLab: how to run the TNL site day to day. Someone who did not build it should be
able to do each of these from this page alone. Accounts for GitHub, Cloudflare, Neon and Brevo
are held by the agency, not by one developer.

## Publish

The client does this themselves in the CMS: save, then **Publiceren** in the bar at the top.

What happens: `/admin/api/publish` inserts a `builds` row (`pending`) and calls the Workers
Builds deploy hook. The build (`npm run build`) claims that row (`building`), reads Neon with
the read-only role, writes `static/build-info.json` with the row id, prerenders every page and
runs `verify-build`. The deploy command (`npm run deploy`) runs `wrangler deploy`, then
`mark-live`. The CMS polls `/build-info.json` and only shows **Live** when it carries the new id.
No new id after 15 minutes shows **Mislukt**; nothing is lost, the change count stays.

If a publish fails:

1. Cloudflare dashboard → Workers & Pages → `tnl-website` → Deployments / Builds → open the
   failed build log (`BUILD_LOG_URL` links there from the CMS).
2. A `verify-build` failure names the page and the rule (for example a title over 62
   characters). Fix the content in the CMS and publish again.
3. A build that cannot reach Neon fails on purpose (it never publishes seed content over the
   client's). Check the Neon console: the project may be suspended (Free plan compute hours) or
   the `tnl_build` password changed.

A code change is published by merging to `main`; the same build runs.

## Reset the CMS password

```sh
# .dev.vars pointing at the PRODUCTION branch (DATABASE_URL = tnl_app on main)
ADMIN_EMAIL=grouptnl@outlook.com npm run seed:account -- --reset
```

It prints a new password, signs out every session and clears a code lockout. Send it to the
client separately from the gate credentials (`npm run send-invite -- login --password '…'`).
If the client lost the gate password: Cloudflare → `tnl-website` → Settings → Variables and
Secrets → `ADMIN_GATE_PASSWORD`, then `npm run send-invite -- gate`.

A lockout after 10 wrong codes lifts by itself after 15 minutes.

## Restore a backup

Two layers: Neon's own 6-hour point-in-time restore (Neon console → Branches → Restore) for
"I deleted it just now", and the R2 copies for anything older.

**Database** (nightly dump in R2 `tnl-backups/db/`, 30 days):

1. Take the one free Neon snapshot of `main` first (Neon console → Backup & restore).
2. Download the dump: Cloudflare → R2 → `tnl-backups` → `db/tnl-<date>.sql.gz`.
3. Neon console → Branches → create a branch `restore-<date>` from `main` (or an empty one).
4. Load it as the owner role:
   ```sh
   gunzip -c tnl-<date>.sql.gz | psql "$OWNER_URL_OF_RESTORE_BRANCH" -v ON_ERROR_STOP=1 --single-transaction
   ```
   (on a branch that already has the tables, drop and recreate the `public` schema first, then
   run `psql -f scripts/sql/roles.sql`).
5. Check it: point `DATABASE_URL_BUILD` at the restore branch and run `npm run build` locally;
   the site must build the same pages.
6. To make it live, either promote the branch in Neon (Branches → Set as default) and update the
   connection strings in Cloudflare, or copy the needed rows back into `main`.

**Photos** (weekly mirror in R2 `tnl-media-mirror`, same keys as the Neon bucket):

```sh
rclone copy r2:tnl-media-mirror/originals/<uuid>.jpg neon:media/originals/   # one photo
rclone sync r2:tnl-media-mirror neon:media                                   # everything
```

(rclone remotes as in `.github/workflows/media-mirror.yml`.) If Neon Object Storage itself is
gone, point `STORAGE_ENDPOINT` and the keys at R2 instead (`src/lib/server/storage.ts` is
S3-generic) and publish.

The restore was rehearsed on the `dev` branch: record the date and result here.

| Date | Who | Database | Photo | Notes |
| --- | --- | --- | --- | --- |
| _to do in phase 6_ | | | | |

## Routine

- Nightly 00:30 UTC: `db-backup` (GitHub Actions). Weekly Sunday 02:00 UTC: `media-mirror`.
  Both e-mail the repository owners when they fail.
- Daily 03:00 UTC: the Worker cron deletes files unused for 24 hours and contact messages
  older than 12 months.
- Neon usage e-mails warn before the Free plan limits (100 CU-hours, 5 GB storage and egress).
- Before a production migration: Neon snapshot, then `DATABASE_URL_OWNER=… npm run db:migrate`,
  then `psql -f scripts/sql/roles.sql` if the migration added tables.
