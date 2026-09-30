/** Validation for every CMS form. Messages are Dutch, as the client sees them. */
import { z } from 'zod';
import { META_DESCRIPTION_MAX, SEO_TITLE_MAX } from '../../seo';

const slug = z
	.string()
	.min(1, 'Vul een adres (slug) in.')
	.max(80)
	.regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Gebruik alleen kleine letters, cijfers en koppeltekens.');
const uuid = z.string().uuid().nullable();
const seoTitle = z.string().max(SEO_TITLE_MAX, `Maximaal ${SEO_TITLE_MAX} tekens.`).nullable();
const metaDescription = z.string().max(META_DESCRIPTION_MAX, `Maximaal ${META_DESCRIPTION_MAX} tekens.`).nullable();
const req = (msg: string, max = 200) => z.string().min(1, msg).max(max);

export const pageSchema = z.object({
	title: req('Vul een titel in.', 120),
	intro: z.string().max(600),
	body: z.string().max(20000),
	heroMediaId: uuid,
	seoTitle,
	metaDescription,
	noindex: z.boolean()
});

export const serviceSchema = z.object({
	slug,
	title: req('Vul een titel in.', 80),
	summary: z.string().max(300),
	body: z.string().max(20000),
	items: z
		.array(z.object({ name: z.string().min(1, 'Elke rij heeft een naam nodig.').max(80), detail: z.string().max(160) }))
		.max(12, 'Maximaal twaalf onderdelen.'),
	tileTheme: z.enum(['forest', 'olive', 'light']),
	heroMediaId: uuid,
	isPublished: z.boolean(),
	seoTitle,
	metaDescription
});

export const projectSchema = z
	.object({
		slug,
		title: req('Vul een titel in.', 120),
		serviceId: uuid,
		subService: z.string().max(80).nullable(),
		summary: z.string().max(300),
		body: z.string().max(20000),
		coverMediaId: uuid,
		beforeMediaId: uuid,
		afterMediaId: uuid,
		gallery: z.array(z.string().uuid()).max(40),
		location: z.string().max(80).nullable(),
		completedOn: z
			.string()
			.regex(/^\d{4}-\d{2}-\d{2}$/, 'Kies een geldige datum.')
			.nullable(),
		isFeatured: z.boolean(),
		isPublished: z.boolean(),
		seoTitle,
		metaDescription
	})
	.refine((p) => !!p.beforeMediaId === !!p.afterMediaId, {
		message: 'Kies zowel een voor- als een na-foto, of geen van beide.',
		path: ['afterMediaId']
	});

export const reviewSchema = z
	.object({
		quote: req('Vul de review in.', 600),
		authorName: req('Vul de naam van de klant in.', 80),
		place: z.string().max(80).nullable(),
		serviceId: uuid,
		rating: z.number().int().min(1).max(5).nullable(),
		source: z.enum(['google', 'facebook', 'direct']),
		consentConfirmed: z.boolean(),
		photoMediaId: uuid,
		isPublished: z.boolean()
	})
	.refine((r) => !r.isPublished || r.consentConfirmed, {
		message: 'Een review kan pas online als de klant toestemming gaf.',
		path: ['consentConfirmed']
	});

export const faqSchema = z.object({
	question: req('Vul de vraag in.', 200),
	answer: req('Vul het antwoord in.', 1200),
	serviceId: uuid,
	isPublished: z.boolean()
});

export const statSchema = z.object({
	value: req('Vul het cijfer in.', 12),
	label: req('Vul de uitleg in.', 160),
	isPublished: z.boolean()
});

export const postSchema = z.object({
	slug,
	title: req('Vul een titel in.', 120),
	intro: z.string().max(400),
	body: z.string().max(50000),
	category: z.string().max(40).nullable(),
	publishedOn: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'Kies een geldige datum.')
		.nullable(),
	coverMediaId: uuid,
	isPublished: z.boolean(),
	seoTitle,
	metaDescription
});

const phone = z.string().min(6, 'Vul een telefoonnummer in.').max(40);
export const settingsSchema = z.object({
	company: z.object({
		name: req('Vul de bedrijfsnaam in.', 80),
		street: req('Vul de straat in.', 120),
		postcode: z.string().regex(/^\d{4}$/, 'Een Belgische postcode heeft vier cijfers.'),
		city: req('Vul de gemeente in.', 80),
		companyNumber: z
			.string()
			.max(20)
			.regex(/^$|^BE ?0?\d{3}\.?\d{3}\.?\d{3}$/, 'Schrijf het ondernemingsnummer als BE 0123.456.789.'),
		email: z.string().pipe(z.email({ error: 'Vul een geldig e-mailadres in.' })),
		phone
	}),
	socials: z.object({
		facebook: z.union([z.literal(''), z.url({ error: 'Vul een volledige link in, beginnend met https://' })]),
		instagram: z.union([z.literal(''), z.url({ error: 'Vul een volledige link in, beginnend met https://' })])
	}),
	notifyEmail: z.string().pipe(z.email({ error: 'Vul een geldig e-mailadres in.' }))
});

export const redirectSchema = z
	.object({
		fromPath: z
			.string()
			.regex(/^\/[^\s?#]*$/, 'Begin met / en gebruik geen spaties.')
			.max(300),
		toPath: z
			.string()
			.regex(/^(\/[^\s]*|https:\/\/\S+)$/, 'Begin met / of https://')
			.max(500),
		status: z.union([z.literal(301), z.literal(302)]),
		note: z.string().max(200).nullable()
	})
	.refine((r) => r.fromPath !== r.toPath, { message: 'Van en naar zijn hetzelfde.', path: ['toPath'] })
	.refine((r) => !/^\/(admin|api|_app|media)(\/|$)/.test(r.fromPath), {
		message: 'Dit adres kan niet worden doorverwezen.',
		path: ['fromPath']
	});

/** Stats: max 3 published, enforced in the CMS. */
export const MAX_PUBLISHED_STATS = 3;
