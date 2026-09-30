# Build, publish and deploy

One Worker, `tnl-website`, is built by [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/deploy-hooks/) from GitHub and deployed with `@sveltejs/adapter-cloudflare` as a Worker with static assets. Prerendered pages are served as static files without running the Worker. Only `/admin/*` and `/api/*` reach Worker code, and they read Neon through the Drizzle `neon-http` driver.

`wrangler.jsonc` follows the [SvelteKit adapter docs](https://svelte.dev/docs/kit/adapter-cloudflare): `main` = `.svelte-kit/cloudflare/_worker.js`, an `assets` binding `ASSETS` on `.svelte-kit/cloudflare`, the `nodejs_als` compatibility flag, and a cron trigger `0 3 * * *` for the media sweep.

## Workers Builds commands

- Build: `npm ci && npm run build`. `npm run build` runs `build-images`, then `vite build` (prerender reads Neon through the read-only role), then `verify-build`, which fails the build if any check fails.
- Deploy: `npx wrangler deploy && npm run mark-live`. `mark-live` sets the build's row in `builds` to `live`.

## The publish cycle

1. The client edits in `/admin`. Saves go to Neon; the live site is unchanged.
2. **Publiceren** posts to `/api/publish`. The server checks the session, inserts a `builds` row as `pending`, and POSTs to the deploy hook URL (a secret, never sent to the browser). The hook targets `main`.
3. Workers Builds builds and deploys, usually a few minutes (measure the real time in phase 5 and tell the client). The CMS shows *Bezig met publiceren* and disables the button.
4. The CMS polls `/build-info.json` on the live site. The build writes that file with its build id and time. When the live file shows the new id, the CMS reports *Live*. It never shows a green state it has not seen on the live site, the same rule as One Man Agency.
5. No new id after 15 minutes means *Mislukt*, with a link to the build log for the admin. The unpublished-changes count stays, so nothing is lost.

## Limits and guards

- Deploy hooks are limited to 10 builds per minute per Worker and 100 per account. A second trigger while one is queued returns the queued build instead of starting another.
- Code pushes to `main` also deploy. Pull requests get preview builds on their own URLs, all reading the shared Neon `dev` branch.
- Workers Paid includes 6,000 build minutes a month and 6 concurrent builds, far more than this site needs.
- Each publish downloads every image in use from Neon, which counts against the Free plan's 5 GB of monthly egress (see [Media](04-media.md)).
- The build must succeed with Neon unreachable in local development: `content.ts` falls back to `scripts/seed.json`, as One Man Agency does.
