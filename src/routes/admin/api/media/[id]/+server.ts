/** Streams an original from the private bucket to the CMS (thumbnails, preview). Session required. */
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { requireUser } from '$lib/server/cms/guard';
import { getDb, schema as t } from '$lib/server/db';
import { checkUpload } from '$lib/server/cms/upload';
import { getStorage } from '$lib/server/env';
import { variantsFor } from '$lib/media-rules';

export const GET: RequestHandler = async ({ locals, params }) => {
	requireUser(locals, { api: true });
	if (!/^[0-9a-f-]{36}$/i.test(params.id ?? '')) error(404, 'Niet gevonden');
	const db = await getDb();
	const [m] = await db.select().from(t.media).where(eq(t.media.id, params.id!)).limit(1);
	if (!m) error(404, 'Niet gevonden');
	const obj = await (await getStorage()).get(m.objectKey);
	if (!obj) error(404, 'Bestand ontbreekt');
	return new Response(obj.body as BodyInit, {
		headers: {
			'content-type': m.mime,
			'cache-control': 'private, no-cache',
			'x-content-type-options': 'nosniff',
			'content-disposition': 'inline'
		}
	});
};

/**
 * Replace a file in place (media library "Vervangen"): every page that uses it shows the new
 * photo after the next publish. The old object is deleted from the bucket.
 */
export const PUT: RequestHandler = async ({ locals, params, request }) => {
	requireUser(locals, { api: true });
	const db = await getDb();
	const [m] = await db.select().from(t.media).where(eq(t.media.id, params.id!)).limit(1);
	if (!m) error(404, 'Niet gevonden');
	const form = await request.formData().catch(() => null);
	const up = await checkUpload(form?.get('file') ?? null);
	if (!up.ok) return json({ error: up.error }, { status: up.status });
	const storage = await getStorage();
	const objectKey = `originals/${crypto.randomUUID()}.${up.ext}`;
	await storage.put(objectKey, up.bytes, up.type);
	await db
		.update(t.media)
		.set({ objectKey, fileName: up.fileName, mime: up.type, bytes: up.bytes.byteLength, width: up.width, height: up.height, variants: variantsFor(m.id, up.width) })
		.where(eq(t.media.id, m.id));
	await storage.delete(m.objectKey).catch((e) => console.error('media replace: old object not deleted', e));
	return json({ media: { id: m.id, width: up.width, height: up.height, alt: m.alt, fileName: up.fileName, src: `/admin/api/media/${m.id}?v=${Date.now()}` } });
};
