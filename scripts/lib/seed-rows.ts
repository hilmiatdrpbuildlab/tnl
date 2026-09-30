/**
 * Turns scripts/seed-data.ts into table rows (the Rows shape), processing each seed photo the
 * same way an upload is processed: long side at most 2400 px, JPEG quality 85, EXIF stripped.
 */
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import type { Rows } from '../../src/lib/server/content-map';
import { MAX_LONG_SIDE, variantsFor } from '../../src/lib/media-rules';
import * as d from '../seed-data';

export interface ProcessedPhoto {
	id: string;
	objectKey: string;
	bytes: Uint8Array;
	width: number;
	height: number;
}

export async function processPhoto(file: string): Promise<Omit<ProcessedPhoto, 'id' | 'objectKey'>> {
	const input = await readFile(`seed/photos/${file}`);
	const { data, info } = await sharp(input)
		.rotate()
		.resize({ width: MAX_LONG_SIDE, height: MAX_LONG_SIDE, fit: 'inside', withoutEnlargement: true })
		.jpeg({ quality: 85, mozjpeg: true })
		.toBuffer({ resolveWithObject: true });
	return { bytes: new Uint8Array(data), width: info.width, height: info.height };
}

export async function buildSeedRows(): Promise<{ rows: Rows; photos: ProcessedPhoto[]; files: Record<string, string> }> {
	const now = new Date('2026-09-30T00:00:00Z');
	const ts = { createdAt: now, updatedAt: now };
	const photos: ProcessedPhoto[] = [];
	const files: Record<string, string> = {};
	for (const m of d.seedMedia) {
		const p = await processPhoto(m.file);
		photos.push({ id: m.id, objectKey: `originals/${m.id}.jpg`, ...p });
		files[m.id] = m.file;
	}
	const media = d.seedMedia.map((m, i) => ({
		id: m.id,
		objectKey: photos[i]!.objectKey,
		fileName: m.file.split('/').pop()!,
		mime: 'image/jpeg',
		bytes: photos[i]!.bytes.byteLength,
		width: photos[i]!.width,
		height: photos[i]!.height,
		alt: m.alt,
		variants: variantsFor(m.id, photos[i]!.width),
		unusedSince: null,
		...ts
	}));

	const rows: Rows = {
		pages: d.seedPages.map((p) => ({ ...p, noindex: false, ...ts })),
		services: d.seedServices.map((s) => ({ ...s, isPublished: true, ...ts })),
		projects: d.seedProjects.map((p) => ({
			...p,
			location: null,
			completedOn: null,
			isPublished: true,
			seoTitle: null,
			metaDescription: null,
			...ts
		})),
		projectMedia: d.seedProjectMedia.map((pm) => ({ ...pm, ...ts })),
		reviews: [],
		faqs: d.seedFaqs.map((f) => ({ ...f, isPublished: true, ...ts })),
		stats: d.seedStats.map((s) => ({ ...s, isPublished: true, ...ts })),
		posts: [],
		media,
		settings: [{ id: true, ...d.seedSettings, pendingDeletions: [], ...ts }],
		redirects: d.seedRedirects.map((r) => ({ ...r, ...ts }))
	};
	return { rows, photos, files };
}
