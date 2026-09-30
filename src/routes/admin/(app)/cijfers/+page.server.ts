import { fail } from '@sveltejs/kit';
import { and, asc, count, eq, ne } from 'drizzle-orm';
import { noteDeletion } from '$lib/server/cms/changes';
import { bool, fieldErrors, int, str } from '$lib/server/cms/form';
import { requireUser } from '$lib/server/cms/guard';
import { moveRow, nextSortOrder } from '$lib/server/cms/order';
import { MAX_PUBLISHED_STATS, statSchema } from '$lib/server/cms/validators';
import { getDb, schema as t } from '$lib/server/db';

export async function load() {
	const db = await getDb();
	return { stats: await db.select().from(t.stats).orderBy(asc(t.stats.sortOrder)), max: MAX_PUBLISHED_STATS };
}

export const actions = {
	save: async ({ request, locals }) => {
		requireUser(locals);
		const db = await getDb();
		const f = await request.formData();
		const id = str(f, 'id');
		const parsed = statSchema.safeParse({ value: str(f, 'value'), label: str(f, 'label'), isPublished: bool(f, 'isPublished') });
		if (!parsed.success) return fail(400, { id, errors: fieldErrors(parsed.error.issues) });
		if (parsed.data.isPublished) {
			const [{ n }] = await db
				.select({ n: count() })
				.from(t.stats)
				.where(id ? and(eq(t.stats.isPublished, true), ne(t.stats.id, id)) : eq(t.stats.isPublished, true));
			if (n >= MAX_PUBLISHED_STATS)
				return fail(400, { id, errors: { isPublished: `Er staan al ${MAX_PUBLISHED_STATS} cijfers online. Verberg er eerst een.` } });
		}
		if (id) await db.update(t.stats).set(parsed.data).where(eq(t.stats.id, id));
		else await db.insert(t.stats).values({ ...parsed.data, sortOrder: await nextSortOrder(db, t.stats) });
		return { id, saved: true };
	},
	delete: async ({ request, locals }) => {
		requireUser(locals);
		const db = await getDb();
		const f = await request.formData();
		await db.delete(t.stats).where(eq(t.stats.id, str(f, 'id')));
		await noteDeletion(db);
		return { deleted: true };
	},
	move: async ({ request, locals }) => {
		requireUser(locals);
		const f = await request.formData();
		await moveRow(await getDb(), t.stats, str(f, 'id'), int(f, 'dir') < 0 ? -1 : 1);
	}
};
