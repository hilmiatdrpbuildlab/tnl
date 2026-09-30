/** Slugs: lowercase Dutch, unique per table. Renaming one writes a redirect automatically. */
import { eq, sql } from 'drizzle-orm';
import type { Db } from '../db/client';
import * as t from '../db/schema';

export function slugify(input: string): string {
	return input
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/&/g, ' en ')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80)
		.replace(/-+$/g, '');
}

export const isValidSlug = (s: string) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);

export const pathFor = { services: '/diensten/', projects: '/projecten/', posts: '/blog/' } as const;
export type SluggedTable = keyof typeof pathFor;

/**
 * Statements for a slug change from `oldSlug` to `newSlug`: a 301 from the old path, existing
 * redirects to the old path re-pointed (no chains), and any redirect from the new path removed.
 */
export function redirectOnRename(db: Db, table: SluggedTable, oldSlug: string, newSlug: string): unknown[] {
	if (!oldSlug || oldSlug === newSlug) return [];
	const from = pathFor[table] + oldSlug;
	const to = pathFor[table] + newSlug;
	return [
		db.delete(t.redirects).where(eq(t.redirects.fromPath, to)),
		db.update(t.redirects).set({ toPath: to }).where(eq(t.redirects.toPath, from)),
		db
			.insert(t.redirects)
			.values({ fromPath: from, toPath: to, status: 301, note: 'Automatisch: slug gewijzigd' })
			.onConflictDoUpdate({ target: t.redirects.fromPath, set: { toPath: to, status: 301, updatedAt: sql`now()` } })
	];
}
