import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { noteDeletion } from '$lib/server/cms/changes';
import { altStatements, dbErrorMessage, mediaMap } from '$lib/server/cms/editor';
import { bool, fieldErrors, jsonField, optStr, str, uuidOrNull } from '$lib/server/cms/form';
import { requireUser } from '$lib/server/cms/guard';
import { deleteWithMedia, saveWithMedia } from '$lib/server/cms/media-service';
import { nextSortOrder } from '$lib/server/cms/order';
import { redirectOnRename, slugify } from '$lib/server/cms/slugs';
import { serviceSchema } from '$lib/server/cms/validators';
import { getDb, schema as t } from '$lib/server/db';
import { getStorage } from '$lib/server/env';
import { refsFor } from '$lib/server/media-refs';

const blank = {
	id: '',
	slug: '',
	title: '',
	summary: '',
	body: '',
	items: [] as { name: string; detail: string }[],
	tileTheme: 'light' as const,
	heroMediaId: null as string | null,
	isPublished: false,
	seoTitle: null as string | null,
	metaDescription: null as string | null
};

export async function load({ params }) {
	const db = await getDb();
	if (params.id === 'nieuw') return { service: blank, isNew: true, media: {} as Record<string, { id: string; alt: string }> };
	const [service] = await db.select().from(t.services).where(eq(t.services.id, params.id)).limit(1);
	if (!service) error(404, 'Dienst niet gevonden');
	return { service, isNew: false, media: await mediaMap(db, [service.heroMediaId]) };
}

export const actions = {
	save: async ({ request, params, locals }) => {
		requireUser(locals);
		const db = await getDb();
		const f = await request.formData();
		const isNew = params.id === 'nieuw';
		const [existing] = isNew ? [] : await db.select().from(t.services).where(eq(t.services.id, params.id)).limit(1);
		if (!isNew && !existing) error(404, 'Dienst niet gevonden');
		const parsed = serviceSchema.safeParse({
			slug: str(f, 'slug') || slugify(str(f, 'title')),
			title: str(f, 'title'),
			summary: str(f, 'summary'),
			body: str(f, 'body'),
			items: jsonField(f, 'items', []),
			tileTheme: str(f, 'tileTheme') || 'light',
			heroMediaId: uuidOrNull(f, 'heroMediaId'),
			isPublished: bool(f, 'isPublished'),
			seoTitle: optStr(f, 'seoTitle'),
			metaDescription: optStr(f, 'metaDescription')
		});
		if (!parsed.success) return fail(400, { errors: fieldErrors(parsed.error.issues) });
		const id = existing?.id ?? crypto.randomUUID();
		const main = existing
			? db.update(t.services).set(parsed.data).where(eq(t.services.id, id))
			: db.insert(t.services).values({ ...parsed.data, id, sortOrder: await nextSortOrder(db, t.services) });
		try {
			await saveWithMedia(db, await getStorage(), 'services', id, refsFor('services', parsed.data), [
				main,
				...altStatements(db, f, ['heroMediaId']),
				...(existing ? redirectOnRename(db, 'services', existing.slug, parsed.data.slug) : [])
			]);
		} catch (e) {
			const err = dbErrorMessage(e);
			return fail(400, { errors: { [err.field ?? '_']: err.message } });
		}
		if (isNew) redirect(303, `/admin/diensten/${id}?saved=1`);
		return { saved: true };
	},
	delete: async ({ params, locals }) => {
		requireUser(locals);
		const db = await getDb();
		await deleteWithMedia(db, await getStorage(), 'services', params.id, [db.delete(t.services).where(eq(t.services.id, params.id))]);
		await noteDeletion(db);
		redirect(303, '/admin/diensten');
	}
};
