import { desc } from 'drizzle-orm';
import { getDb, schema as t } from '$lib/server/db';

export async function load() {
	const db = await getDb();
	return { posts: await db.select().from(t.posts).orderBy(desc(t.posts.publishedOn), desc(t.posts.createdAt)) };
}
