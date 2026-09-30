import { error, fail, redirect } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { noteDeletion } from '$lib/server/cms/changes';
import { altStatements, dbErrorMessage, mediaMap } from '$lib/server/cms/editor';
import { bool, fieldErrors, jsonField, optStr, str, uuidOrNull } from '$lib/server/cms/form';
import { requireUser } from '$lib/server/cms/guard';
import { deleteWithMedia, saveWithMedia } from '$lib/server/cms/media-service';
import { nextSortOrder } from '$lib/server/cms/order';
import { redirectOnRename, slugify } from '$lib/server/cms/slugs';
import { projectSchema } from '$lib/server/cms/validators';
import { getDb, schema as t } from '$lib/server/db';
import { getStorage } from '$lib/server/env';
import { refsFor } from '$lib/server/media-refs';

const blank = {
	id: '',
	slug: '',
	title: '',
	serviceId: null as string | null,
	subService: null as string | null,
	summary: '',
	body: '',
	coverMediaId: null as string | null,
	beforeMediaId: null as string | null,
	afterMediaId: null as string | null,
	location: null as string | null,
	completedOn: null as string | null,
	isFeatured: false,
	isPublished: false,
	seoTitle: null as string | null,
	metaDescription: null as string | null
};

export async function load({ params }) {
	const db = await getDb();
	const services = await db.select({ id: t.services.id, title: t.services.title }).from(t.services).orderBy(asc(t.services.sortOrder));
	if (params.id === 'nieuw') return { project: blank, gallery: [], services, isNew: true, media: {} as Record<string, { id: string; alt: string }> };
	const [project] = await db.select().from(t.projects).where(eq(t.projects.id, params.id)).limit(1);
	if (!project) error(404, 'Project niet gevonden');
	const gallery = await db.select().from(t.projectMedia).where(eq(t.projectMedia.projectId, project.id)).orderBy(asc(t.projectMedia.sortOrder));
	const media = await mediaMap(db, [project.coverMediaId, project.beforeMediaId, project.afterMediaId, ...gallery.map((g) => g.mediaId)]);
	return { project, gallery: gallery.map((g) => media[g.mediaId]).filter(Boolean), services, isNew: false, media };
}

export const actions = {
	save: async ({ request, params, locals }) => {
		requireUser(locals);
		const db = await getDb();
		const f = await request.formData();
		const isNew = params.id === 'nieuw';
		const [existing] = isNew ? [] : await db.select().from(t.projects).where(eq(t.projects.id, params.id)).limit(1);
		if (!isNew && !existing) error(404, 'Project niet gevonden');
		const parsed = projectSchema.safeParse({
			slug: str(f, 'slug') || slugify(str(f, 'title')),
			title: str(f, 'title'),
			serviceId: uuidOrNull(f, 'serviceId'),
			subService: optStr(f, 'subService'),
			summary: str(f, 'summary'),
			body: str(f, 'body'),
			coverMediaId: uuidOrNull(f, 'coverMediaId'),
			beforeMediaId: uuidOrNull(f, 'beforeMediaId'),
			afterMediaId: uuidOrNull(f, 'afterMediaId'),
			gallery: jsonField<string[]>(f, 'gallery', []),
			location: optStr(f, 'location'),
			completedOn: optStr(f, 'completedOn'),
			isFeatured: bool(f, 'isFeatured'),
			isPublished: bool(f, 'isPublished'),
			seoTitle: optStr(f, 'seoTitle'),
			metaDescription: optStr(f, 'metaDescription')
		});
		if (!parsed.success) return fail(400, { errors: fieldErrors(parsed.error.issues) });
		const { gallery, ...row } = parsed.data;
		const id = existing?.id ?? crypto.randomUUID();
		const main = existing
			? db.update(t.projects).set(row).where(eq(t.projects.id, id))
			: db.insert(t.projects).values({ ...row, id, sortOrder: await nextSortOrder(db, t.projects) });
		const galleryQs = [
			db.delete(t.projectMedia).where(eq(t.projectMedia.projectId, id)),
			...(gallery.length
				? [db.insert(t.projectMedia).values([...new Set(gallery)].map((mediaId, i) => ({ projectId: id, mediaId, sortOrder: i + 1 })))]
				: [])
		];
		try {
			await saveWithMedia(db, await getStorage(), 'projects', id, refsFor('projects', row, gallery), [
				main,
				...galleryQs,
				...altStatements(db, f, ['coverMediaId', 'beforeMediaId', 'afterMediaId']),
				...(existing ? redirectOnRename(db, 'projects', existing.slug, row.slug) : [])
			]);
		} catch (e) {
			const err = dbErrorMessage(e);
			return fail(400, { errors: { [err.field ?? '_']: err.message } });
		}
		if (isNew) redirect(303, `/admin/projecten/${id}?saved=1`);
		return { saved: true };
	},
	delete: async ({ params, locals }) => {
		requireUser(locals);
		const db = await getDb();
		await deleteWithMedia(db, await getStorage(), 'projects', params.id, [db.delete(t.projects).where(eq(t.projects.id, params.id))]);
		await noteDeletion(db);
		redirect(303, '/admin/projecten');
	}
};
