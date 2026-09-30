/**
 * Node-only database client for scripts, tests and local development against a plain Postgres
 * (for example in CI). Production and the Neon branches always use ./client.ts (neon-http).
 *
 * node-postgres has no `batch`, so a sequential shim is attached. It is not atomic; that is fine
 * for local work, and the real transactional behaviour comes from Neon in every deployed env.
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { createDb, type Db } from './client';
import * as schema from './schema';

export function isNeonUrl(url: string) {
	return /\.neon\.tech|\.neon\.build|neon\.com/.test(url);
}

export function createNodeDb(url: string): { db: Db; close: () => Promise<void> } {
	if (isNeonUrl(url)) return { db: createDb(url), close: async () => {} };
	const pool = new pg.Pool({ connectionString: url, max: 4 });
	const db = drizzle({ client: pool, schema, casing: 'snake_case' }) as unknown as Db;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(db as any).batch = async (qs: readonly unknown[]) => {
		const out: unknown[] = [];
		for (const q of qs) out.push(await (q as Promise<unknown>));
		return out;
	};
	return { db, close: () => pool.end() };
}
