import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	casing: 'snake_case',
	// Migrations run as the Neon owner role (DATABASE_URL_OWNER), never as tnl_app.
	dbCredentials: { url: process.env.DATABASE_URL_OWNER ?? process.env.DATABASE_URL ?? '' },
	strict: true,
	verbose: true
});
