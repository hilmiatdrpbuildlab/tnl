-- updated_at trigger for every content table, so the CMS can count unpublished changes.
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  -- settings.pending_deletions is bookkeeping for the banner, not content.
  -- (nested IFs: PL/pgSQL does not short-circuit, and other tables have no NEW.company)
  IF TG_TABLE_NAME = 'settings' THEN
    IF to_jsonb(NEW) - 'pending_deletions' - 'updated_at' = to_jsonb(OLD) - 'pending_deletions' - 'updated_at' THEN
      NEW.updated_at := OLD.updated_at;
      RETURN NEW;
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
--> statement-breakpoint
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['media','pages','services','projects','project_media','reviews','faqs','stats','posts','settings','redirects']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I_set_updated_at ON %I', t, t);
    EXECUTE format('CREATE TRIGGER %I_set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
  END LOOP;
END;
$$;
