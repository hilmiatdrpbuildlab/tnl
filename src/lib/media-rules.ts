/**
 * Pure media rules, shared by the CMS, the build and the unit tests (docs/cms-plan/04-media.md).
 */
import type { ImageVariant } from './server/db/schema';

/** Upload limits: 10 MB before scaling in the browser, 2400 px on the long side after. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_LONG_SIDE = 2400;
/** What the server accepts after the browser scaled it (a little headroom for PNG/WebP). */
export const MAX_STORED_BYTES = 8 * 1024 * 1024;
/** 720 is added to the plan's 480/960/1600/2400: phones at ~1.75× pick it instead of 960 (mobile LCP). */
export const VARIANT_WIDTHS = [480, 720, 960, 1600, 2400] as const;
/** Files unused for longer than this are removed by the daily sweep. */
export const SWEEP_AFTER_MS = 24 * 60 * 60 * 1000;

export const UPLOAD_ERRORS = {
	type: 'Dit bestandstype wordt niet ondersteund. Kies een JPG, PNG of WebP.',
	tooLarge: 'Dit bestand is te groot. Kies een foto van maximaal 10 MB.',
	dimensions: 'Deze foto is te groot. Verklein hem tot maximaal 2400 pixels breed of hoog.',
	unreadable: 'Deze foto kon niet worden gelezen. Probeer een andere foto.'
} as const;

/** The WebP variants the build writes for an image, never wider than the original. */
export function variantsFor(id: string, width: number): ImageVariant[] {
	const widths: number[] = VARIANT_WIDTHS.filter((w) => w <= width);
	if (!widths.length || widths[widths.length - 1]! < Math.min(width, MAX_LONG_SIDE)) {
		widths.push(Math.min(width, MAX_LONG_SIDE));
	}
	return [...new Set(widths)].map((w) => ({ w, src: `/media/${id}-${w}.webp` }));
}

export function srcsetOf(variants: ImageVariant[]): string {
	return variants.map((v) => `${v.src} ${v.w}w`).join(', ');
}

/** Pick the variant closest to 960 px as the fallback `src`. */
export function defaultVariant(variants: ImageVariant[]): ImageVariant | undefined {
	return variants.find((v) => v.w >= 960) ?? variants[variants.length - 1];
}

export interface MediaRef {
	field: string;
	mediaId: string;
}

/** Where each owner table keeps its media, for `media_usages`. */
export const MEDIA_FIELDS = {
	pages: ['hero'],
	services: ['hero'],
	projects: ['cover', 'before', 'after', 'gallery'],
	reviews: ['photo'],
	posts: ['cover']
} as const;
export type OwnerTable = keyof typeof MEDIA_FIELDS;

const key = (r: MediaRef) => `${r.field}:${r.mediaId}`;

/** Diff the usages before and after a save. */
export function diffUsages(before: MediaRef[], after: MediaRef[]) {
	const b = new Map(before.map((r) => [key(r), r]));
	const a = new Map(after.map((r) => [key(r), r]));
	return {
		added: [...a.values()].filter((r) => !b.has(key(r))),
		removed: [...b.values()].filter((r) => !a.has(key(r)))
	};
}

/**
 * Files that may have become unused after a save or delete: dropped by this owner and not
 * still used by it under another field. The caller still checks other owners in the database.
 */
export function orphanCandidates(before: MediaRef[], after: MediaRef[]): string[] {
	const still = new Set(after.map((r) => r.mediaId));
	return [...new Set(before.map((r) => r.mediaId))].filter((id) => !still.has(id));
}

/** True when a file unused since `unusedSince` is due for the daily sweep. */
export function isDueForSweep(unusedSince: Date | null, now: Date, usageCount: number): boolean {
	return usageCount === 0 && !!unusedSince && now.getTime() - unusedSince.getTime() > SWEEP_AFTER_MS;
}
