import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

/**
 * A Drizzle client over Neon's HTTP driver: one fetch per query, safe to create per request on
 * Workers. neon-http has no interactive transactions; multi-statement saves use `db.batch([...])`,
 * which Neon runs as one transaction.
 */
export function createDb(url: string) {
	return drizzle({ client: neon(url), schema, casing: 'snake_case' });
}

export type Db = ReturnType<typeof createDb>;
export { schema };
