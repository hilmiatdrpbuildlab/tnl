import { error, fail, redirect } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { noteDeletion } from '$lib/server/cms/changes';
import { altStatements, dbErrorMessage, mediaMap } from '$lib/server/cms/editor';
import { bool, fieldErrors, int, optStr, str, uuidOrNull } from '$lib/server/cms/form';
import { requireUser } from '$lib/server/cms/guard';
import { deleteWithMedia, saveWithMedia } from '$lib/server/cms/media-service';
import { nextSortOrder } from '$lib/server/cms/order';
import { reviewSchema } from '$lib/server/cms/validators';
import { getDb, schema as t } from '$lib/server/db';
import { getStorage } from '$lib/server/env';
import { refsFor } from '$lib/server/media-refs';

const blank = {
	id: '',
	quote: '',
	authorName: '',
	place: null as string | null,
	serviceId: null as string | null,
	rating: null as number | null,
	source: 'direct' as const,
	consentConfirmed: false,
	photoMediaId: null as string | null,
	isPublished: false
};

export async function load({ params }) {
	const db = await getDb();
	const services = await db.select({ id: t.services.id, title: t.services.title }).from(t.services).orderBy(asc(t.services.sortOrder));
	if (params.id === 'nieuw') return { review: blank, services, isNew: true, media: {} as Record<string, { id: string; alt: string }> };
	const [review] = await db.select().from(t.reviews).where(eq(t.reviews.id, params.id)).limit(1);
	if (!review) error(404, 'Review niet gevonden');
	return { review, services, isNew: false, media: await mediaMap(db, [review.photoMediaId]) };
}

export const actions = {
	save: async ({ request, params, locals }) => {
		requireUser(locals);
		const db = await getDb();
		const f = await request.formData();
		const isNew = params.id === 'nieuw';
		const [existing] = isNew ? [] : await db.select().from(t.reviews).where(eq(t.reviews.id, params.id)).limit(1);
		if (!isNew && !existing) error(404, 'Review niet gevonden');
		const rating = int(f, 'rating', 0);
		const parsed = reviewSchema.safeParse({
			quote: str(f, 'quote'),
			authorName: str(f, 'authorName'),
			place: optStr(f, 'place'),
			serviceId: uuidOrNull(f, 'serviceId'),
			rating: rating >= 1 && rating <= 5 ? rating : null,
			source: str(f, 'source') || 'direct',
			consentConfirmed: bool(f, 'consentConfirmed'),
			photoMediaId: uuidOrNull(f, 'photoMediaId'),
			isPublished: bool(f, 'isPublished')
		});
		if (!parsed.success) return fail(400, { errors: fieldErrors(parsed.error.issues) });
		const id = existing?.id ?? crypto.randomUUID();
		const main = existing
			? db.update(t.reviews).set(parsed.data).where(eq(t.reviews.id, id))
			: db.insert(t.reviews).values({ ...parsed.data, id, sortOrder: await nextSortOrder(db, t.reviews) });
		try {
			await saveWithMedia(db, await getStorage(), 'reviews', id, refsFor('reviews', parsed.data), [main, ...altStatements(db, f, ['photoMediaId'])]);
		} catch (e) {
			const err = dbErrorMessage(e);
			return fail(400, { errors: { [err.field ?? '_']: err.message } });
		}
		if (isNew) redirect(303, `/admin/reviews/${id}?saved=1`);
		return { saved: true };
	},
	delete: async ({ params, locals }) => {
		requireUser(locals);
		const db = await getDb();
		await deleteWithMedia(db, await getStorage(), 'reviews', params.id, [db.delete(t.reviews).where(eq(t.reviews.id, params.id))]);
		await noteDeletion(db);
		redirect(303, '/admin/reviews');
	}
};
