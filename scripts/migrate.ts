/**
 * Applies the committed SQL migrations in /drizzle as the Neon owner role.
 * Before a production migration, take the one free Neon snapshot (see HANDOVER.md).
 *   DATABASE_URL_OWNER=... npm run db:migrate
 */
import './lib/env';
import { need } from './lib/env';
import { isNeonUrl } from '../src/lib/server/db/client-node';

const url = process.env.DATABASE_URL_OWNER ?? need('DATABASE_URL');

if (isNeonUrl(url)) {
	const { neon } = await import('@neondatabase/serverless');
	const { drizzle } = await import('drizzle-orm/neon-http');
	const { migrate } = await import('drizzle-orm/neon-http/migrator');
	await migrate(drizzle({ client: neon(url) }), { migrationsFolder: 'drizzle' });
} else {
	const pg = (await import('pg')).default;
	const { drizzle } = await import('drizzle-orm/node-postgres');
	const { migrate } = await import('drizzle-orm/node-postgres/migrator');
	const pool = new pg.Pool({ connectionString: url });
	await migrate(drizzle({ client: pool }), { migrationsFolder: 'drizzle' });
	await pool.end();
}
console.log('Migrations applied.');
