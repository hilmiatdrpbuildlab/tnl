import type { Db } from '../db/client';

/**
 * Runs several statements as one Neon transaction (neon-http `batch`). With the local
 * node-postgres client the shim runs them in order.
 */
export async function runBatch(db: Db, queries: unknown[]): Promise<void> {
	const qs = queries.filter(Boolean);
	if (!qs.length) return;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	await (db as any).batch(qs);
}
