import { fail } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { str } from '$lib/server/cms/form';
import { requireUser } from '$lib/server/cms/guard';
import { deleteIfUnused, usagesOf } from '$lib/server/cms/media-service';
import { getDb, schema as t } from '$lib/server/db';
import { getStorage } from '$lib/server/env';

export async function load() {
	const db = await getDb();
	const media = await db.select().from(t.media).orderBy(desc(t.media.createdAt));
	const usages = await usagesOf(db, media.map((m) => m.id));
	return {
		media: media.map((m) => ({
			id: m.id,
			fileName: m.fileName,
			alt: m.alt,
			width: m.width,
			height: m.height,
			bytes: m.bytes,
			usages: (usages.get(m.id) ?? []).map((u) => ({ label: u.label, href: u.href }))
		}))
	};
}

export const actions = {
	alt: async ({ request, locals }) => {
		requireUser(locals);
		const f = await request.formData();
		await (await getDb()).update(t.media).set({ alt: str(f, 'alt').slice(0, 300) }).where(eq(t.media.id, str(f, 'id')));
		return { savedAlt: str(f, 'id') };
	},
	delete: async ({ request, locals }) => {
		requireUser(locals);
		const db = await getDb();
		const id = str(await request.formData(), 'id');
		const used = (await usagesOf(db, [id])).get(id) ?? [];
		if (used.length) return fail(409, { id, usedBy: used.map((u) => u.label) });
		await deleteIfUnused(db, await getStorage(), [id]);
		return { deleted: id };
	}
};
