# TNL Group website and CMS: build plan

30 September 2026 · Lathif Sihab-Dewantoro

We are rebuilding tnlgroup.be (TNL Group, garden construction, maintenance and handyman work in Berendrecht) as one SvelteKit app. It has a prerendered public site built on the TNL Group design system v2, and a custom CMS at `/admin` on the same domain. It follows the One Man Agency pattern with two swaps: Neon replaces Supabase, and Cloudflare replaces Vercel. The plan stops at a working site on a `*.workers.dev` URL; moving the domain off Wix is handled separately.

## Decisions already taken

| Area | Decision |
| --- | --- |
| Framework | SvelteKit + TypeScript, one app: public site, `/admin` CMS and API routes |
| Rendering | Public pages prerendered from Neon at build time; the CMS **Publish** button triggers a rebuild |
| Database | Neon Postgres, accessed through Drizzle ORM with SQL migration files |
| Media | Neon Object Storage (S3-compatible). Files are deleted when the client removes or replaces them |
| Hosting | Cloudflare Workers with static assets, built by Workers Builds from GitHub |
| Plans | Neon Free; the existing Cloudflare Workers Paid plan. No new monthly cost |
| Backups | Nightly database dump and weekly photo mirror to Cloudflare R2 |
| CMS access | Direct link `/admin`, HTTP Basic gate, then e-mail + password + one-time code |
| Accounts | One CMS account, for TNL |
| E-mail | Brevo, for login codes and new-message notifications |
| Language | Dutch only |
| Editable content | Pages, services, projects, reviews, FAQ, stats, blog |
| CMS tools | Submissions inbox, site settings, SEO + redirects |
| Design | TNL Group design system v2 (`design-system-v2/`): tokens, `tnl.css`, 18 components |

Reference implementation: `DRPBuildLab/one-man-agency cms` (SvelteKit + Supabase + Vercel). Reuse its CMS editors, publish banner, Basic gate and Brevo mail code wherever the swap allows.

## Contents

1. [Architecture](01-architecture.md)
2. [Repository layout](02-repository.md)
3. [Database schema](03-database.md)
4. [Media](04-media.md)
5. [CMS at /admin](05-cms.md)
6. [Public site](06-public-site.md)
7. [Build, publish and deploy](07-build-and-deploy.md)
8. [Security and privacy](08-security.md)
9. [Environments and secrets](09-environments.md)
10. [Phases and tasks](10-phases.md)
11. [Testing and handover](11-testing-and-handover.md)
12. [Decisions and open items](12-open-items.md)
