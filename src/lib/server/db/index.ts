import { dev } from '$app/environment';
import { env } from '../env';
import { createDb, type Db } from './client';

let cached: { url: string; db: Db } | null = null;

/**
 * The app's database (role tnl_app). Server code only.
 * In `npm run dev` a non-Neon URL (a local Postgres) is supported through node-postgres.
 */
export async function getDb(): Promise<Db> {
	const url = env.DATABASE_URL;
	if (!url) throw new Error('DATABASE_URL is not set');
	if (cached?.url === url) return cached.db;
	let db: Db;
	if (dev && !/neon/.test(url)) {
		const { createNodeDb } = await import('./client-node');
		db = createNodeDb(url).db;
	} else {
		db = createDb(url);
	}
	cached = { url, db };
	return db;
}

export { schema } from './client';
export type { Db } from './client';
