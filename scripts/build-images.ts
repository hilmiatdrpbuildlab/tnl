/**
 * Build step 2: resized WebP variants for every image in use (docs/cms-plan/04-media.md).
 * Downloads each original with the read-only storage credential (or reads the seed photo),
 * writes 480/960/1600/2400 px WebP files to static/media/, and removes files no longer used.
 * Variants already on disk are kept, so a local rebuild is quick.
 */
import './lib/env';
import sharp from 'sharp';
import { mkdir, readdir, readFile, rm, stat } from 'node:fs/promises';
import { variantsFor } from '../src/lib/media-rules';
import { scriptStorage } from './lib/storage';

interface UsedMedia {
	id: string;
	objectKey: string;
	width: number;
	height: number;
	seedFile: string | null;
}

const OUT = 'static/media';
const media = JSON.parse(await readFile('src/lib/generated/media.json', 'utf8')) as UsedMedia[];
await mkdir(OUT, { recursive: true });

const exists = (p: string) => stat(p).then(() => true, () => false);
const storage = media.some((m) => !m.seedFile) ? scriptStorage('read') : null;
const wanted = new Set<string>();
let made = 0;
let bytesIn = 0;

for (const m of media) {
	const variants = variantsFor(m.id, m.width);
	const files = variants.map((v) => ({ w: v.w, path: `${OUT}/${m.id}-${v.w}.webp` }));
	files.forEach((f) => wanted.add(f.path.split('/').pop()!));
	const missing = [];
	for (const f of files) if (!(await exists(f.path))) missing.push(f);
	if (!missing.length) continue;

	let original: Uint8Array;
	if (m.seedFile) {
		original = new Uint8Array(await readFile(`seed/photos/${m.seedFile}`));
	} else {
		const obj = await storage!.get(m.objectKey);
		if (!obj) throw new Error(`Original missing in the bucket: ${m.objectKey} (media ${m.id})`);
		original = obj.body;
	}
	bytesIn += original.byteLength;
	for (const f of missing) {
		await sharp(original)
			.rotate()
			.resize({ width: f.w, withoutEnlargement: true })
			.webp({ quality: 62, effort: 6, smartSubsample: true })
			.toFile(f.path);
		made++;
	}
}

let removed = 0;
for (const f of await readdir(OUT)) {
	if (!wanted.has(f)) {
		await rm(`${OUT}/${f}`);
		removed++;
	}
}
console.log(
	`Images: ${media.length} in use, ${made} variants written, ${removed} stale removed, ${(bytesIn / 1e6).toFixed(1)} MB downloaded.`
);
