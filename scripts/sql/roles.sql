-- Database roles for TNL (docs/cms-plan/08-security.md). Run once per Neon project as the owner,
-- after creating the three roles in the Neon console (Roles → New role), which sets their passwords:
--   tnl_app     read/write, used by the Worker (DATABASE_URL)
--   tnl_build   read-only on content tables, used by the prerender (DATABASE_URL_BUILD)
--   tnl_backup  read-only on every table, used only by the nightly dump (BACKUP_DATABASE_URL)
-- None of them is the owner role. Neon branches copy roles and grants, so dev inherits them.
-- Re-run after a migration that adds tables (the grants below cover existing tables only;
-- the ALTER DEFAULT PRIVILEGES lines cover tables the owner creates later).

-- tnl_app: read/write on everything, no DDL.
GRANT USAGE ON SCHEMA public TO tnl_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO tnl_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO tnl_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO tnl_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO tnl_app;

-- tnl_build: read-only on the tables the public site is built from (plus builds for mark-live).
GRANT USAGE ON SCHEMA public TO tnl_build;
GRANT SELECT ON pages, services, projects, project_media, reviews, faqs, stats, posts,
  media, settings, redirects TO tnl_build;
-- mark-live runs in the Workers Builds deploy step and only flips the build row.
GRANT SELECT, UPDATE (status, finished_at, detail, build_uuid) ON builds TO tnl_build;

-- tnl_backup: read-only on every table.
GRANT USAGE ON SCHEMA public TO tnl_backup;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO tnl_backup;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO tnl_backup;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO tnl_backup;

-- Make sure nobody else can write.
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
