-- Phase 0 check: all three roles connect; tnl_build and tnl_backup are refused an INSERT.
-- Run as each role:  psql "$URL" -v ON_ERROR_STOP=0 -f scripts/sql/check-roles.sql
SELECT current_user, count(*) AS pages FROM pages;
INSERT INTO stats (value, label) VALUES ('x', 'role check');  -- must fail for tnl_build / tnl_backup
DELETE FROM stats WHERE label = 'role check';
