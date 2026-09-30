# Database schema

Fourteen tables in one Neon Postgres database (region `aws-eu-central-1`, Frankfurt), defined in `src/lib/server/db/schema.ts`. Drizzle Kit generates the SQL migrations, which are committed and reviewed like code. Every content table has `created_at` and `updated_at` (set by a trigger) so the CMS can count unpublished changes.

| Table | Holds | Key columns | Rules |
| --- | --- | --- | --- |
| `pages` | The fixed pages: home, over-ons, contact and the index pages for diensten, projecten and blog | `slug` (unique), `title`, `intro`, `body` (Markdown), `blocks` (jsonb), `hero_media_id`, `seo_title`, `meta_description`, `noindex` | Rows are seeded, never created or deleted in the CMS. `blocks` is validated per slug with a Zod schema (for example the home hero statement and eyebrow) |
| `services` | Aanleg, Onderhoud, Klusjesdienst | `slug`, `title`, `summary`, `body`, `items` (jsonb `[{name, detail}]`), `tile_theme` (`forest` / `olive` / `light`), `hero_media_id`, `sort_order`, `is_published`, SEO fields | Three rows at launch; the CMS may add more |
| `projects` | Finished jobs | `slug`, `title`, `service_id` (FK), `sub_service`, `summary`, `body`, `cover_media_id`, `before_media_id`, `after_media_id`, `location`, `completed_on`, `is_featured`, `sort_order`, `is_published`, SEO fields | Before and after are both set or both empty (check constraint). `location` is shown only when filled |
| `project_media` | Extra gallery photos per project | `project_id`, `media_id`, `sort_order` | Cascade on project delete |
| `reviews` | Testimonials | `quote`, `author_name`, `place`, `service_id`, `rating` (1–5, nullable), `source` (`google` / `facebook` / `direct`), `consent_confirmed`, `photo_media_id`, `sort_order`, `is_published` | Cannot be published unless `consent_confirmed` is true |
| `faqs` | FAQ items | `question`, `answer`, `service_id` (nullable = general), `sort_order`, `is_published` | |
| `stats` | Stat figures | `value` (text, e.g. "100%"), `label`, `sort_order`, `is_published` | Max 3 published, enforced in the CMS |
| `posts` | Blog articles | `slug`, `title`, `intro`, `body`, `category`, `published_on`, `cover_media_id`, `is_published`, SEO fields | |
| `media` | Every uploaded file | `id`, `object_key`, `file_name`, `mime`, `bytes`, `width`, `height`, `alt`, `variants` (jsonb) | See [Media](04-media.md) for deletion rules |
| `media_usages` | Where each file is used | `media_id`, `owner_table`, `owner_id`, `field` | Rewritten in the same transaction as every save |
| `settings` | One row: company details and socials | `company` (jsonb: name, street, postcode, city, company number, e-mail, phone), `socials` (jsonb), `notify_email` | `id boolean primary key check (id)` forces a single row |
| `redirects` | Old Wix URLs and renamed slugs | `from_path` (unique), `to_path`, `status` (301 / 302), `note` | Written into the build as `_redirects` |
| `submissions` | Contact-form messages | `first_name`, `last_name`, `email`, `subject`, `message`, `is_read`, `notified_at`, `created_at` | Deleted by the daily cron after 12 months. `notified_at` is set when the Brevo mail went out; a row can be missing if Neon was down, but the mail is always sent first |
| `builds` | Publish history | `status` (`pending` / `building` / `live` / `failed`), `triggered_at`, `finished_at`, `build_uuid`, `detail` | |

Better Auth adds its own tables (`user`, `session`, `account`, `verification`, `two_factor`), generated with its CLI into the same Drizzle schema.

SEO fields everywhere are `seo_title` (check: 62 characters or fewer) and `meta_description` (158 or fewer), as in One Man Agency. Slugs are lowercase Dutch, unique per table, and changing one writes a row to `redirects` automatically.

The public site reads only published rows, and only at build time. There is no row-level security as in Supabase: the database is reached only from server code, with one role for the app and one read-only role for the build.
