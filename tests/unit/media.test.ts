import { describe, expect, it } from 'vitest';
import { diffUsages, isDueForSweep, orphanCandidates, SWEEP_AFTER_MS, variantsFor } from '../../src/lib/media-rules';
import { refsFor } from '../../src/lib/server/media-refs';
import { imageSize, sniffImageType } from '../../src/lib/server/image-info';
import { readFileSync } from 'node:fs';
import sharp from 'sharp';

describe('variants', () => {
	it('never upscales and always includes the largest width', () => {
		expect(variantsFor('x', 1386).map((v) => v.w)).toEqual([480, 720, 960, 1386]);
		expect(variantsFor('x', 2400).map((v) => v.w)).toEqual([480, 720, 960, 1600, 2400]);
		expect(variantsFor('x', 300).map((v) => v.w)).toEqual([300]);
		expect(variantsFor('abc', 960)[2]!.src).toBe('/media/abc-960.webp');
	});
});

describe('media usages', () => {
	const A = 'aaaaaaaa-0000-4000-8000-000000000001';
	const B = 'bbbbbbbb-0000-4000-8000-000000000002';
	it('replacing a photo makes the old one an orphan candidate', () => {
		const before = [{ field: 'cover', mediaId: A }];
		const after = [{ field: 'cover', mediaId: B }];
		expect(orphanCandidates(before, after)).toEqual([A]);
		expect(diffUsages(before, after)).toEqual({ added: after, removed: before });
	});
	it('a photo still used under another field of the same row is not a candidate', () => {
		const before = [
			{ field: 'cover', mediaId: A },
			{ field: 'after', mediaId: A }
		];
		expect(orphanCandidates(before, [{ field: 'after', mediaId: A }])).toEqual([]);
	});
	it('deleting a row makes all its files candidates', () => {
		expect(orphanCandidates([{ field: 'cover', mediaId: A }, { field: 'gallery', mediaId: B }], [])).toEqual([A, B]);
	});
	it('the sweep only takes files unused for more than 24 hours', () => {
		const now = new Date('2026-10-01T03:00:00Z');
		expect(isDueForSweep(new Date(now.getTime() - SWEEP_AFTER_MS - 1), now, 0)).toBe(true);
		expect(isDueForSweep(new Date(now.getTime() - SWEEP_AFTER_MS + 60_000), now, 0)).toBe(false);
		expect(isDueForSweep(new Date(0), now, 1)).toBe(false);
		expect(isDueForSweep(null, now, 0)).toBe(false);
	});
	it('project refs include the before/after pair and the gallery once each', () => {
		expect(refsFor('projects', { coverMediaId: A, beforeMediaId: A, afterMediaId: B }, [B, B])).toEqual([
			{ field: 'cover', mediaId: A },
			{ field: 'before', mediaId: A },
			{ field: 'after', mediaId: B },
			{ field: 'gallery', mediaId: B }
		]);
	});
});

describe('image sniffing (bytes, not file names)', () => {
	it('recognises JPEG, PNG and WebP and reads their size', async () => {
		const jpg = new Uint8Array(readFileSync('seed/photos/project-na.jpg'));
		expect(sniffImageType(jpg)).toBe('image/jpeg');
		expect(imageSize(jpg, 'image/jpeg')).toEqual({ width: 1386, height: 1187 });
		const png = new Uint8Array(await sharp({ create: { width: 7, height: 5, channels: 3, background: '#fff' } }).png().toBuffer());
		expect(sniffImageType(png)).toBe('image/png');
		expect(imageSize(png, 'image/png')).toEqual({ width: 7, height: 5 });
		const webp = new Uint8Array(await sharp({ create: { width: 9, height: 4, channels: 3, background: '#000' } }).webp().toBuffer());
		expect(sniffImageType(webp)).toBe('image/webp');
		expect(imageSize(webp, 'image/webp')).toEqual({ width: 9, height: 4 });
	});
	it('refuses SVG, HEIC and a JPEG name on other bytes', () => {
		expect(sniffImageType(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBeNull();
		expect(sniffImageType(new Uint8Array([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63]))).toBeNull();
		expect(sniffImageType(new TextEncoder().encode('GIF89a'))).toBeNull();
	});
});
