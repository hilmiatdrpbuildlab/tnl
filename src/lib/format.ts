import type { Company, Img } from './types';

const MONTHS = [
	'januari',
	'februari',
	'maart',
	'april',
	'mei',
	'juni',
	'juli',
	'augustus',
	'september',
	'oktober',
	'november',
	'december'
];

/** `2026-03-12` → `12 maart 2026` (design system: dates day first, in words). */
export function formatDate(iso: string | null | undefined): string {
	if (!iso) return '';
	const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
	if (!y || !m || !d) return '';
	return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** `+32 (0) 495 75 54 37` → `tel:+32495755437`. */
export function telHref(phone: string): string {
	return 'tel:' + phone.replace(/\(0\)/g, '').replace(/[^\d+]/g, '');
}

export function addressLine(c: Company): string {
	return `${c.street}, ${c.postcode} ${c.city}`;
}

/** Initials for the review avatar (never a stock portrait). */
export function initials(name: string): string {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((p) => p[0]!.toUpperCase())
		.join('');
}

/** Attributes for an <img> built from an Img. */
export function imgAttrs(img: Img, sizes = '100vw') {
	return {
		src: img.src,
		srcset: img.srcset || undefined,
		sizes: img.srcset ? sizes : undefined,
		width: img.width,
		height: img.height,
		alt: img.alt
	};
}
