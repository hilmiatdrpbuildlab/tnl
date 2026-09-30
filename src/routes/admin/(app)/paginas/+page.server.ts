import { asc } from 'drizzle-orm';
import { getDb, schema as t } from '$lib/server/db';

export async function load() {
	const db = await getDb();
	const pages = await db.select({ id: t.pages.id, slug: t.pages.slug, title: t.pages.title, updatedAt: t.pages.updatedAt }).from(t.pages).orderBy(asc(t.pages.slug));
	const order = ['home', 'diensten', 'projecten', 'over-ons', 'contact', 'blog'];
	pages.sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
	return { pages };
}
