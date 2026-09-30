import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { noteDeletion } from '$lib/server/cms/changes';
import { altStatements, dbErrorMessage, mediaMap } from '$lib/server/cms/editor';
import { bool, fieldErrors, optStr, str, uuidOrNull } from '$lib/server/cms/form';
import { requireUser } from '$lib/server/cms/guard';
import { deleteWithMedia, saveWithMedia } from '$lib/server/cms/media-service';
import { redirectOnRename, slugify } from '$lib/server/cms/slugs';
import { postSchema } from '$lib/server/cms/validators';
import { getDb, schema as t } from '$lib/server/db';
import { getStorage } from '$lib/server/env';
import { refsFor } from '$lib/server/media-refs';

export async function load({ params }) {
	const db = await getDb();
	if (params.id === 'nieuw')
		return {
			post: {
				id: '',
				slug: '',
				title: '',
				intro: '',
				body: '',
				category: null as string | null,
				publishedOn: new Date().toISOString().slice(0, 10) as string | null,
				coverMediaId: null as string | null,
				isPublished: false,
				seoTitle: null as string | null,
				metaDescription: null as string | null
			},
			isNew: true,
			media: {} as Record<string, { id: string; alt: string }>
		};
	const [post] = await db.select().from(t.posts).where(eq(t.posts.id, params.id)).limit(1);
	if (!post) error(404, 'Artikel niet gevonden');
	return { post, isNew: false, media: await mediaMap(db, [post.coverMediaId]) };
}

export const actions = {
	save: async ({ request, params, locals }) => {
		requireUser(locals);
		const db = await getDb();
		const f = await request.formData();
		const isNew = params.id === 'nieuw';
		const [existing] = isNew ? [] : await db.select().from(t.posts).where(eq(t.posts.id, params.id)).limit(1);
		if (!isNew && !existing) error(404, 'Artikel niet gevonden');
		const parsed = postSchema.safeParse({
			slug: str(f, 'slug') || slugify(str(f, 'title')),
			title: str(f, 'title'),
			intro: str(f, 'intro'),
			body: str(f, 'body'),
			category: optStr(f, 'category'),
			publishedOn: optStr(f, 'publishedOn'),
			coverMediaId: uuidOrNull(f, 'coverMediaId'),
			isPublished: bool(f, 'isPublished'),
			seoTitle: optStr(f, 'seoTitle'),
			metaDescription: optStr(f, 'metaDescription')
		});
		if (!parsed.success) return fail(400, { errors: fieldErrors(parsed.error.issues) });
		const id = existing?.id ?? crypto.randomUUID();
		const main = existing ? db.update(t.posts).set(parsed.data).where(eq(t.posts.id, id)) : db.insert(t.posts).values({ ...parsed.data, id });
		try {
			await saveWithMedia(db, await getStorage(), 'posts', id, refsFor('posts', parsed.data), [
				main,
				...altStatements(db, f, ['coverMediaId']),
				...(existing ? redirectOnRename(db, 'posts', existing.slug, parsed.data.slug) : [])
			]);
		} catch (e) {
			const err = dbErrorMessage(e);
			return fail(400, { errors: { [err.field ?? '_']: err.message } });
		}
		if (isNew) redirect(303, `/admin/blog/${id}?saved=1`);
		return { saved: true };
	},
	delete: async ({ params, locals }) => {
		requireUser(locals);
		const db = await getDb();
		await deleteWithMedia(db, await getStorage(), 'posts', params.id, [db.delete(t.posts).where(eq(t.posts.id, params.id))]);
		await noteDeletion(db);
		redirect(303, '/admin/blog');
	}
};
