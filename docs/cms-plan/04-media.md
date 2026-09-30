# Media

Originals live in one private bucket, `media`, in [Neon Object Storage](https://neon.com/docs/storage/overview), reached with the AWS S3 SDK. Visitors never load from the bucket: the build copies each image into the static output as resized WebP files. That keeps the bucket private, the public site fast, and a deleted original can't break the live site before the next publish.

## Upload flow

1. The client picks a photo in `ImageField` or the media library.
2. The browser scales it to at most 2400 px on the long side and re-encodes it as JPEG at quality 85. That also strips EXIF data, which on phone photos includes the GPS location of the client's customers.
   The picker accepts JPEG, PNG and WebP files up to 10 MB before scaling. Anything else is refused with a Dutch message, for example *"Dit bestandstype wordt niet ondersteund. Kies een JPG, PNG of WebP."* iPhones normally convert HEIC to JPEG when uploading from Safari; a HEIC file picked on a desktop is refused.
3. `POST /admin/api/media` checks the session, sniffs the type from the file's bytes, and checks the scaled size. It stores the file at `originals/<uuid>.jpg` and writes a `media` row with width, height and alt text.
4. The editor saves the content row. In the same transaction, the save rewrites that row's `media_usages`.
5. At build time `scripts/build-images.ts` downloads every image in use and writes 480, 960, 1600 and 2400 px WebP variants to `static/media/` (running `sharp` in the Workers Builds container). Components use the `srcset` from `media.variants`.

## Deleting unused files (the client's cost rule)

- **On save:** when a save drops a file from `media_usages` and no other row uses it, the server deletes the object with `DeleteObject`, then its `media` row. Replacing a photo therefore deletes the old one.
- **On delete:** deleting a project, post or review removes its usages, then applies the same check to each file it used.
- **Daily sweep:** a Workers cron trigger at 03:00 deletes files that have been unused for more than 24 hours. That catches uploads abandoned before a save.
- The media library shows each file's usages. Deleting a file that is still used is refused, with the list of pages that use it.

## Notes for the team

- Object Storage is in beta ([buckets](https://neon.com/docs/storage/buckets), [S3 compatibility](https://neon.com/docs/storage/s3-compatibility)). Keep every call behind `src/lib/server/storage.ts`, so moving to Cloudflare R2 later means only a new endpoint and new credentials.
- **Weekly safety copy.** A scheduled GitHub Action (`.github/workflows/media-mirror.yml`, Sundays 04:00) runs `rclone sync` from the Neon bucket to the R2 bucket `tnl-media-mirror` on DRP BuildLab's Cloudflare account. If the beta ever fails, `storage.ts` switches to R2 and no photo is lost.
- **Limits on Neon Free:** 5 GB of Object Storage and 5 GB of egress a month per project. Every publish downloads each image in use (about 100 MB for 150 photos), so watch egress in the Neon console. The Neon usage e-mails warn before the limit. Check whether storage downloads count toward egress; if egress ever becomes the constraint, cache the generated variants in R2 between builds.
- Set `forcePathStyle: true` on the S3 client, as Neon's docs require.
- Buckets branch with the database. A preview branch sees production files copy-on-write, and deletes there do not touch production.
