/** Media library API: list (GET) and upload (POST). Session required on both. */
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import { requireUser } from '$lib/server/cms/guard';
import { checkUpload } from '$lib/server/cms/upload';
import { getDb, schema as t } from '$lib/server/db';
import { getStorage } from '$lib/server/env';
import { variantsFor } from '$lib/media-rules';

export const GET: RequestHandler = async ({ locals }) => {
	requireUser(locals, { api: true });
	const db = await getDb();
	const rows = await db.select().from(t.media).orderBy(desc(t.media.createdAt));
	return json({
		media: rows.map((m) => ({ id: m.id, width: m.width, height: m.height, alt: m.alt, fileName: m.fileName, src: `/admin/api/media/${m.id}` }))
	});
};

export const POST: RequestHandler = async ({ locals, request }) => {
	requireUser(locals, { api: true });
	const form = await request.formData().catch(() => null);
	const up = await checkUpload(form?.get('file') ?? null);
	if (!up.ok) return json({ error: up.error }, { status: up.status });

	const id = crypto.randomUUID();
	const objectKey = `originals/${id}.${up.ext}`;
	const alt = String(form?.get('alt') ?? '').trim().slice(0, 300);
	const storage = await getStorage();
	await storage.put(objectKey, up.bytes, up.type);
	try {
		// unused_since is set: an upload nobody saves is removed by the daily sweep after 24 h.
		await (await getDb()).insert(t.media).values({
			id,
			objectKey,
			fileName: up.fileName,
			mime: up.type,
			bytes: up.bytes.byteLength,
			width: up.width,
			height: up.height,
			alt,
			variants: variantsFor(id, up.width),
			unusedSince: new Date()
		});
	} catch (e) {
		await storage.delete(objectKey).catch(() => {});
		console.error('media upload: row insert failed', e);
		error(500, 'Opslaan is mislukt');
	}
	return json({ media: { id, width: up.width, height: up.height, alt, fileName: up.fileName, src: `/admin/api/media/${id}` } }, { status: 201 });
};
