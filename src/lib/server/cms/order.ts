/** Up/down ordering for list screens: renumbers sort_order 1..n with the item moved. */
import { asc, eq } from 'drizzle-orm';
import type { AnyPgColumn, PgTable } from 'drizzle-orm/pg-core';
import type { Db } from '../db/client';
import { runBatch } from './batch';

type Sortable = PgTable & { id: AnyPgColumn; sortOrder: AnyPgColumn };

export function reorder<T extends { id: string }>(ids: T[], id: string, dir: -1 | 1): T[] {
	const i = ids.findIndex((x) => x.id === id);
	const j = i + dir;
	if (i < 0 || j < 0 || j >= ids.length) return ids;
	const out = [...ids];
	[out[i], out[j]] = [out[j]!, out[i]!];
	return out;
}

export async function moveRow(db: Db, table: Sortable, id: string, dir: -1 | 1) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const rows = (await db.select({ id: table.id }).from(table as any).orderBy(asc(table.sortOrder))) as { id: string }[];
	const next = reorder(rows, id, dir);
	if (next === rows) return;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	await runBatch(db, next.map((r, i) => db.update(table as any).set({ sortOrder: i + 1 }).where(eq(table.id, r.id))));
}

export async function nextSortOrder(db: Db, table: Sortable) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const rows = (await db.select({ s: table.sortOrder }).from(table as any)) as { s: number }[];
	return rows.reduce((m, r) => Math.max(m, r.s), 0) + 1;
}
