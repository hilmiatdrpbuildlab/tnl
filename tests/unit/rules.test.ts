import { describe, expect, it } from 'vitest';
import { clip, META_DESCRIPTION_MAX, pageTitle, SEO_TITLE_MAX, seoLengthIssues } from '../../src/lib/seo';
import { slugify, isValidSlug } from '../../src/lib/server/cms/slugs';
import { reorder } from '../../src/lib/server/cms/order';
import { csvCell } from '../../src/lib/server/cms/csv';
import { headerSafe, isHoneypotFilled, notificationMail, parseSubmission } from '../../src/lib/server/submission';
import { slide } from '../../src/lib/server/ratelimit';
import { checkBasicAuth, gateEnabled } from '../../src/lib/server/gate';
import { renderMarkdown, safeHref } from '../../src/lib/markdown';
import { parseBlocks } from '../../src/lib/blocks';
import { projectSchema, reviewSchema, settingsSchema } from '../../src/lib/server/cms/validators';
import { formatDate, telHref } from '../../src/lib/format';

describe('SEO length rules', () => {
	it('flags titles over 62 and descriptions over 158 characters', () => {
		expect(seoLengthIssues('x'.repeat(62), 'y'.repeat(158))).toEqual([]);
		expect(seoLengthIssues('x'.repeat(63), 'y'.repeat(159)).map((i) => i.field)).toEqual(['seo_title', 'meta_description']);
	});
	it('builds page titles within the limit', () => {
		expect(pageTitle('Aanleg')).toBe('Aanleg | TNL Group');
		expect(pageTitle('x'.repeat(80)).length).toBeLessThanOrEqual(SEO_TITLE_MAX);
		expect(clip('woord '.repeat(60), META_DESCRIPTION_MAX).length).toBeLessThanOrEqual(META_DESCRIPTION_MAX);
	});
});

describe('slugs and redirects', () => {
	it('makes lowercase Dutch slugs', () => {
		expect(slugify('Tuinpad tussen beukenhagen')).toBe('tuinpad-tussen-beukenhagen');
		expect(slugify('Schuttingen & omheiningen')).toBe('schuttingen-en-omheiningen');
		expect(slugify('Efficiënt  snoeien!')).toBe('efficient-snoeien');
		expect(isValidSlug('a-b-1')).toBe(true);
		expect(isValidSlug('A b')).toBe(false);
	});
	it('reorders without losing rows', () => {
		const rows = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
		expect(reorder(rows, 'b', -1).map((r) => r.id)).toEqual(['b', 'a', 'c']);
		expect(reorder(rows, 'c', 1)).toBe(rows);
	});
});

describe('contact form validation', () => {
	const form = (o: Record<string, string>) => {
		const f = new FormData();
		for (const [k, v] of Object.entries(o)) f.set(k, v);
		return f;
	};
	it('requires Voornaam, Email and Uw bericht; the rest is optional', () => {
		expect(parseSubmission(form({ voornaam: 'Jan', email: 'jan@voorbeeld.be', bericht: 'Haag snoeien' })).success).toBe(true);
		const bad = parseSubmission(form({ voornaam: ' ', email: 'jan@', bericht: '' }));
		expect(bad.success).toBe(false);
		if (!bad.success) expect(bad.error.issues.map((i) => i.path[0]).sort()).toEqual(['bericht', 'email', 'voornaam']);
	});
	it('caps lengths', () => {
		expect(parseSubmission(form({ voornaam: 'J', email: 'j@x.be', bericht: 'x'.repeat(5001) })).success).toBe(false);
	});
	it('detects the honeypot', () => {
		expect(isHoneypotFilled(form({ website: 'http://spam' }))).toBe(true);
		expect(isHoneypotFilled(form({ website: '' }))).toBe(false);
	});
	it('keeps header injection out of the mail', () => {
		expect(headerSafe('Hallo\r\nBcc: x@y.z')).toBe('Hallo Bcc: x@y.z');
		const m = notificationMail({ voornaam: 'Jan\n', achternaam: '', email: 'jan@x.be', onderwerp: 'Offerte\r\nBcc: a@b.c', bericht: '<b>hi</b>' });
		expect(m.subject).not.toMatch(/[\r\n]/);
		expect(m.replyTo.email).toBe('jan@x.be');
		expect(m.text).toContain('<b>hi</b>'); // plain text; the HTML part escapes it
	});
});

describe('rate limit window', () => {
	it('allows 5 per 10 minutes and refuses the sixth', () => {
		let ts: number[] = [];
		const t0 = 1_000_000;
		for (let i = 0; i < 5; i++) {
			const r = slide(ts, t0 + i * 1000);
			expect(r.allowed).toBe(true);
			ts = r.timestamps;
		}
		expect(slide(ts, t0 + 6000).allowed).toBe(false);
		expect(slide(ts, t0 + 10 * 60 * 1000 + 1).allowed).toBe(true);
	});
});

describe('Basic gate', () => {
	const hdr = (u: string, p: string) => 'Basic ' + btoa(`${u}:${p}`);
	it('checks both parts', () => {
		expect(checkBasicAuth(hdr('tnl', 's3cret:x'), 'tnl', 's3cret:x')).toBe(true);
		expect(checkBasicAuth(hdr('tnl', 'wrong'), 'tnl', 's3cret:x')).toBe(false);
		expect(checkBasicAuth(null, 'tnl', 'x')).toBe(false);
		expect(checkBasicAuth('Basic !!!', 'tnl', 'x')).toBe(false);
	});
	it('is off without credentials (local only)', () => {
		expect(gateEnabled('', '')).toBe(false);
		expect(gateEnabled('a', 'b')).toBe(true);
	});
});

describe('Markdown is sanitised', () => {
	it('escapes raw HTML and scripts', () => {
		const html = renderMarkdown('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>');
		expect(html).not.toMatch(/<script|<img/);
	});
	it('drops javascript: links and adds rel=noopener to external ones', () => {
		expect(renderMarkdown('[x](javascript:alert(1))')).not.toContain('href');
		expect(renderMarkdown('[TNL](https://tnlgroup.be)')).toContain('rel="noopener"');
		expect(safeHref('//evil.com')).toBeNull();
		expect(safeHref('/contact')).toBe('/contact');
	});
});

describe('CMS validation', () => {
	it('before and after are both set or both empty', () => {
		const base = {
			slug: 'x', title: 'X', serviceId: null, subService: null, summary: '', body: '', coverMediaId: null,
			gallery: [], location: null, completedOn: null, isFeatured: false, isPublished: true, seoTitle: null, metaDescription: null
		};
		const id = '0e5a4c0e-0000-4000-8000-000000000001';
		expect(projectSchema.safeParse({ ...base, beforeMediaId: id, afterMediaId: null }).success).toBe(false);
		expect(projectSchema.safeParse({ ...base, beforeMediaId: id, afterMediaId: id }).success).toBe(true);
		expect(projectSchema.safeParse({ ...base, beforeMediaId: null, afterMediaId: null }).success).toBe(true);
	});
	it('a review cannot be published without consent', () => {
		const r = { quote: 'Top', authorName: 'An', place: null, serviceId: null, rating: 5, source: 'google', photoMediaId: null };
		expect(reviewSchema.safeParse({ ...r, consentConfirmed: false, isPublished: true }).success).toBe(false);
		expect(reviewSchema.safeParse({ ...r, consentConfirmed: true, isPublished: true }).success).toBe(true);
	});
	it('settings check the Belgian company number and postcode', () => {
		const s = {
			company: { name: 'TNL', street: 'Dorpstraat 64', postcode: '2040', city: 'Berendrecht', companyNumber: 'BE 0123.456.789', email: 'a@b.be', phone: '+32 (0) 495 75 54 37' },
			socials: { facebook: '', instagram: 'https://www.instagram.com/grouptnl' },
			notifyEmail: 'grouptnl@outlook.com'
		};
		expect(settingsSchema.safeParse(s).success).toBe(true);
		expect(settingsSchema.safeParse({ ...s, company: { ...s.company, postcode: '20400' } }).success).toBe(false);
	});
	it('home blocks need a statement', () => {
		expect(parseBlocks('home', { statement: '' }).success).toBe(false);
		expect(parseBlocks('home', { statement: 'Van A tot Z.' }).success).toBe(true);
	});
});

describe('formatting and CSV', () => {
	it('writes Dutch dates and tel links', () => {
		expect(formatDate('2026-03-12')).toBe('12 maart 2026');
		expect(telHref('+32 (0) 495 75 54 37')).toBe('tel:+32495755437');
	});
	it('defuses spreadsheet formulas in the CSV export', () => {
		expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
		expect(csvCell('gewoon')).toBe('"gewoon"');
	});
});
