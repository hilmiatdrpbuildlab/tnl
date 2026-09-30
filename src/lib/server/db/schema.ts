/**
 * Drizzle schema: the source of the SQL migrations in /drizzle (see docs/cms-plan/03-database.md).
 * Column names are English snake_case. Every content table has created_at/updated_at; updated_at
 * is set by the trigger in drizzle/0001_triggers.sql so the CMS can count unpublished changes.
 */
import { sql } from 'drizzle-orm';
import {
	boolean,
	check,
	date,
	index,
	integer,
	jsonb,
	pgTable,
	smallint,
	text,
	timestamp,
	uniqueIndex,
	uuid
} from 'drizzle-orm/pg-core';

export * from './auth-schema';

const timestamps = {
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
};

const seo = {
	seoTitle: text('seo_title'),
	metaDescription: text('meta_description')
};

/** SEO length checks: 62 / 158 characters, as in One Man Agency. */
const seoChecks = (table: string, t: { seoTitle: unknown; metaDescription: unknown }) => [
	check(`${table}_seo_title_len`, sql`char_length(${t.seoTitle}) <= 62`),
	check(`${table}_meta_description_len`, sql`char_length(${t.metaDescription}) <= 158`)
];

const slugCheck = (table: string, col: unknown) =>
	check(`${table}_slug_format`, sql`${col} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`);

export type ImageVariant = { w: number; src: string };

export const media = pgTable('media', {
	id: uuid('id').primaryKey().defaultRandom(),
	objectKey: text('object_key').notNull().unique(),
	fileName: text('file_name').notNull(),
	mime: text('mime').notNull(),
	bytes: integer('bytes').notNull(),
	width: integer('width').notNull(),
	height: integer('height').notNull(),
	alt: text('alt').notNull().default(''),
	variants: jsonb('variants').$type<ImageVariant[]>().notNull().default([]),
	/** Set when the last usage disappears; the daily sweep deletes files unused for 24 h. */
	unusedSince: timestamp('unused_since', { withTimezone: true }).defaultNow(),
	...timestamps
});

export const pages = pgTable(
	'pages',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		slug: text('slug').notNull().unique(),
		title: text('title').notNull(),
		intro: text('intro').notNull().default(''),
		body: text('body').notNull().default(''),
		blocks: jsonb('blocks').$type<Record<string, unknown>>().notNull().default({}),
		heroMediaId: uuid('hero_media_id').references(() => media.id, { onDelete: 'set null' }),
		...seo,
		noindex: boolean('noindex').notNull().default(false),
		...timestamps
	},
	(t) => [...seoChecks('pages', t)]
);

export const services = pgTable(
	'services',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		slug: text('slug').notNull().unique(),
		title: text('title').notNull(),
		summary: text('summary').notNull().default(''),
		body: text('body').notNull().default(''),
		items: jsonb('items').$type<{ name: string; detail: string }[]>().notNull().default([]),
		tileTheme: text('tile_theme', { enum: ['forest', 'olive', 'light'] })
			.notNull()
			.default('light'),
		heroMediaId: uuid('hero_media_id').references(() => media.id, { onDelete: 'set null' }),
		sortOrder: integer('sort_order').notNull().default(0),
		isPublished: boolean('is_published').notNull().default(false),
		...seo,
		...timestamps
	},
	(t) => [
		...seoChecks('services', t),
		slugCheck('services', t.slug),
		check('services_tile_theme', sql`${t.tileTheme} in ('forest', 'olive', 'light')`)
	]
);

export const projects = pgTable(
	'projects',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		slug: text('slug').notNull().unique(),
		title: text('title').notNull(),
		serviceId: uuid('service_id').references(() => services.id, { onDelete: 'set null' }),
		subService: text('sub_service'),
		summary: text('summary').notNull().default(''),
		body: text('body').notNull().default(''),
		coverMediaId: uuid('cover_media_id').references(() => media.id, { onDelete: 'set null' }),
		beforeMediaId: uuid('before_media_id').references(() => media.id, { onDelete: 'set null' }),
		afterMediaId: uuid('after_media_id').references(() => media.id, { onDelete: 'set null' }),
		location: text('location'),
		completedOn: date('completed_on'),
		isFeatured: boolean('is_featured').notNull().default(false),
		sortOrder: integer('sort_order').notNull().default(0),
		isPublished: boolean('is_published').notNull().default(false),
		...seo,
		...timestamps
	},
	(t) => [
		...seoChecks('projects', t),
		slugCheck('projects', t.slug),
		check(
			'projects_before_after_pair',
			sql`(${t.beforeMediaId} is null) = (${t.afterMediaId} is null)`
		),
		index('projects_service_idx').on(t.serviceId)
	]
);

export const projectMedia = pgTable(
	'project_media',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		projectId: uuid('project_id')
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		mediaId: uuid('media_id')
			.notNull()
			.references(() => media.id, { onDelete: 'cascade' }),
		sortOrder: integer('sort_order').notNull().default(0),
		...timestamps
	},
	(t) => [uniqueIndex('project_media_unique').on(t.projectId, t.mediaId)]
);

export const reviews = pgTable(
	'reviews',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		quote: text('quote').notNull(),
		authorName: text('author_name').notNull(),
		place: text('place'),
		serviceId: uuid('service_id').references(() => services.id, { onDelete: 'set null' }),
		rating: smallint('rating'),
		source: text('source', { enum: ['google', 'facebook', 'direct'] })
			.notNull()
			.default('direct'),
		consentConfirmed: boolean('consent_confirmed').notNull().default(false),
		photoMediaId: uuid('photo_media_id').references(() => media.id, { onDelete: 'set null' }),
		sortOrder: integer('sort_order').notNull().default(0),
		isPublished: boolean('is_published').notNull().default(false),
		...timestamps
	},
	(t) => [
		check('reviews_rating_range', sql`${t.rating} is null or ${t.rating} between 1 and 5`),
		check('reviews_source', sql`${t.source} in ('google', 'facebook', 'direct')`),
		check('reviews_consent_before_publish', sql`not ${t.isPublished} or ${t.consentConfirmed}`)
	]
);

export const faqs = pgTable('faqs', {
	id: uuid('id').primaryKey().defaultRandom(),
	question: text('question').notNull(),
	answer: text('answer').notNull(),
	serviceId: uuid('service_id').references(() => services.id, { onDelete: 'set null' }),
	sortOrder: integer('sort_order').notNull().default(0),
	isPublished: boolean('is_published').notNull().default(false),
	...timestamps
});

export const stats = pgTable('stats', {
	id: uuid('id').primaryKey().defaultRandom(),
	value: text('value').notNull(),
	label: text('label').notNull(),
	sortOrder: integer('sort_order').notNull().default(0),
	isPublished: boolean('is_published').notNull().default(false),
	...timestamps
});

export const posts = pgTable(
	'posts',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		slug: text('slug').notNull().unique(),
		title: text('title').notNull(),
		intro: text('intro').notNull().default(''),
		body: text('body').notNull().default(''),
		category: text('category'),
		publishedOn: date('published_on'),
		coverMediaId: uuid('cover_media_id').references(() => media.id, { onDelete: 'set null' }),
		isPublished: boolean('is_published').notNull().default(false),
		...seo,
		...timestamps
	},
	(t) => [...seoChecks('posts', t), slugCheck('posts', t.slug)]
);

export const mediaUsages = pgTable(
	'media_usages',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		mediaId: uuid('media_id')
			.notNull()
			.references(() => media.id, { onDelete: 'cascade' }),
		ownerTable: text('owner_table').notNull(),
		ownerId: uuid('owner_id').notNull(),
		field: text('field').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [
		uniqueIndex('media_usages_unique').on(t.mediaId, t.ownerTable, t.ownerId, t.field),
		index('media_usages_owner_idx').on(t.ownerTable, t.ownerId)
	]
);

export type CompanyJson = {
	name: string;
	street: string;
	postcode: string;
	city: string;
	companyNumber: string;
	email: string;
	phone: string;
};

export const settings = pgTable(
	'settings',
	{
		/** `id boolean primary key check (id)` forces a single row. */
		id: boolean('id').primaryKey().default(true),
		company: jsonb('company').$type<CompanyJson>().notNull(),
		socials: jsonb('socials').$type<{ facebook?: string; instagram?: string }>().notNull().default({}),
		notifyEmail: text('notify_email').notNull(),
		/** Deletions since the last live publish, so the banner can count them (timestamps). */
		pendingDeletions: jsonb('pending_deletions').$type<string[]>().notNull().default([]),
		...timestamps
	},
	(t) => [check('settings_single_row', sql`${t.id}`)]
);

export const redirects = pgTable(
	'redirects',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		fromPath: text('from_path').notNull().unique(),
		toPath: text('to_path').notNull(),
		status: smallint('status').notNull().default(301),
		note: text('note'),
		...timestamps
	},
	(t) => [
		check('redirects_status', sql`${t.status} in (301, 302)`),
		check('redirects_from_path', sql`${t.fromPath} like '/%'`),
		check('redirects_not_self', sql`${t.fromPath} <> ${t.toPath}`)
	]
);

export const submissions = pgTable(
	'submissions',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		firstName: text('first_name').notNull(),
		lastName: text('last_name'),
		email: text('email').notNull(),
		subject: text('subject'),
		message: text('message').notNull(),
		isRead: boolean('is_read').notNull().default(false),
		notifiedAt: timestamp('notified_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [index('submissions_created_idx').on(t.createdAt)]
);

export const builds = pgTable(
	'builds',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		status: text('status', { enum: ['pending', 'building', 'live', 'failed'] })
			.notNull()
			.default('pending'),
		triggeredAt: timestamp('triggered_at', { withTimezone: true }).notNull().defaultNow(),
		finishedAt: timestamp('finished_at', { withTimezone: true }),
		/** Workers Builds build UUID, when the hook response carries one. */
		buildUuid: text('build_uuid'),
		detail: text('detail')
	},
	(t) => [
		check('builds_status', sql`${t.status} in ('pending', 'building', 'live', 'failed')`),
		index('builds_triggered_idx').on(t.triggeredAt)
	]
);

/** Tables the CMS edits and the banner counts. */
export const contentTables = {
	pages,
	services,
	projects,
	projectMedia,
	reviews,
	faqs,
	stats,
	posts,
	media,
	settings,
	redirects
} as const;
