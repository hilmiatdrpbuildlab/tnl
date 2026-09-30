/**
 * Build step 5: fails the build if any check fails (docs/cms-plan/11-testing-and-handover.md).
 *   every route exists as a static file · titles ≤ 62, descriptions ≤ 158 · JSON-LD parses and
 *   the expected types are present · sitemap lists every published slug · no unpublished row
 *   appears · every <img> has width, height and alt · no image wider than 2400 px · redirects
 *   are valid · the test site is noindex · no secret in the client bundle.
 */
import './lib/env';
import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { META_DESCRIPTION_MAX, SEO_TITLE_MAX } from '../src/lib/seo';
import type { SiteContent } from '../src/lib/types';

const OUT = '.svelte-kit/cloudflare';
const errors: string[] = [];
const warnings: string[] = [];
const fail = (m: string) => errors.push(m);

const content = JSON.parse(await readFile('src/lib/generated/content.json', 'utf8')) as SiteContent;
const build = JSON.parse(await readFile('src/lib/generated/build.json', 'utf8')) as { noindex: boolean; siteUrl: string };

const fileFor = (route: string) => (route === '/' ? `${OUT}/index.html` : `${OUT}${route}.html`);
const routes: { path: string; ld: string[] }[] = [
	{ path: '/', ld: ['HomeAndConstructionBusiness'] },
	{ path: '/diensten', ld: ['HomeAndConstructionBusiness', ...content.services.map(() => 'Service')] },
	{ path: '/projecten', ld: ['HomeAndConstructionBusiness'] },
	{ path: '/over-ons', ld: ['HomeAndConstructionBusiness'] },
	{ path: '/contact', ld: ['HomeAndConstructionBusiness'] },
	{ path: '/blog', ld: ['HomeAndConstructionBusiness'] },
	{ path: '/bedankt', ld: [] },
	{ path: '/formulier-fout', ld: [] },
	{ path: '/404', ld: [] },
	...content.services.map((s) => ({ path: `/diensten/${s.slug}`, ld: ['HomeAndConstructionBusiness', 'Service', 'BreadcrumbList'] })),
	...content.projects.map((p) => ({ path: `/projecten/${p.slug}`, ld: ['HomeAndConstructionBusiness', 'BreadcrumbList'] })),
	...content.posts.map((p) => ({ path: `/blog/${p.slug}`, ld: ['HomeAndConstructionBusiness', 'BlogPosting', 'BreadcrumbList'] }))
];
if (content.faqs.some((f) => !f.serviceId)) routes[0]!.ld.push('FAQPage');

const decode = (s: string) =>
	s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

for (const r of routes) {
	const file = fileFor(r.path);
	if (!existsSync(file)) {
		fail(`${r.path}: no static file (${file})`);
		continue;
	}
	const html = await readFile(file, 'utf8');
	const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '');
	if (!title) fail(`${r.path}: <title> missing`);
	if (title.length > SEO_TITLE_MAX) fail(`${r.path}: title is ${title.length} characters (max ${SEO_TITLE_MAX}): "${title}"`);
	const desc = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');
	if (!desc) fail(`${r.path}: meta description missing`);
	if (desc.length > META_DESCRIPTION_MAX) fail(`${r.path}: description is ${desc.length} characters (max ${META_DESCRIPTION_MAX})`);
	if (!/<link rel="canonical" href="[^"]+"/.test(html)) fail(`${r.path}: canonical missing`);
	if (build.noindex && !/<meta name="robots" content="noindex/.test(html)) fail(`${r.path}: noindex missing on the test site`);

	const types: string[] = [];
	for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
		try {
			const data = JSON.parse(m[1]!) as { '@type'?: string };
			if (data['@type']) types.push(data['@type']);
		} catch {
			fail(`${r.path}: JSON-LD does not parse`);
		}
	}
	for (const want of new Set(r.ld)) {
		const need = r.ld.filter((x) => x === want).length;
		const have = types.filter((x) => x === want).length;
		if (have < need) fail(`${r.path}: expected ${need}× ${want} JSON-LD, found ${have}`);
	}

	for (const m of html.matchAll(/<img\b[^>]*>/g)) {
		const tag = m[0];
		for (const attr of ['width', 'height', 'alt'])
			if (!new RegExp(`\\s${attr}="`).test(tag)) fail(`${r.path}: <img> without ${attr}: ${tag.slice(0, 120)}`);
	}
	if (/\son(load|error)="/.test(html)) fail(`${r.path}: inline event handler (blocked by the CSP)`);
}

// Sitemap
const sitemap = existsSync(`${OUT}/sitemap.xml`) ? await readFile(`${OUT}/sitemap.xml`, 'utf8') : '';
if (!sitemap) fail('sitemap.xml missing');
for (const slug of [
	...content.services.map((s) => `/diensten/${s.slug}`),
	...content.projects.map((p) => `/projecten/${p.slug}`),
	...content.posts.map((p) => `/blog/${p.slug}`)
])
	if (!sitemap.includes(`${build.siteUrl}${slug}</loc>`)) fail(`sitemap.xml does not list ${slug}`);

// robots.txt
const robots = existsSync(`${OUT}/robots.txt`) ? await readFile(`${OUT}/robots.txt`, 'utf8') : '';
if (build.noindex && !/Disallow: \/\s*$/m.test(robots)) fail('robots.txt must block all crawlers on the test site');

// No unpublished row appears (only checkable with database access)
if (process.env.DATABASE_URL_BUILD) {
	const { createNodeDb } = await import('../src/lib/server/db/client-node');
	const t = await import('../src/lib/server/db/schema');
	const { eq } = await import('drizzle-orm');
	const { db, close } = createNodeDb(process.env.DATABASE_URL_BUILD);
	const hidden = [
		...(await db.select({ s: t.services.slug }).from(t.services).where(eq(t.services.isPublished, false))).map((r) => `/diensten/${r.s}`),
		...(await db.select({ s: t.projects.slug }).from(t.projects).where(eq(t.projects.isPublished, false))).map((r) => `/projecten/${r.s}`),
		...(await db.select({ s: t.posts.slug }).from(t.posts).where(eq(t.posts.isPublished, false))).map((r) => `/blog/${r.s}`)
	];
	await close();
	for (const p of hidden) {
		if (existsSync(fileFor(p))) fail(`unpublished ${p} was built`);
		if (sitemap.includes(`${p}</loc>`)) fail(`unpublished ${p} is in the sitemap`);
	}
}

// Images: none wider than 2400 px
if (existsSync(`${OUT}/media`)) {
	for (const f of await readdir(`${OUT}/media`)) {
		const meta = await sharp(path.join(OUT, 'media', f)).metadata();
		if ((meta.width ?? 0) > 2400 || (meta.height ?? 0) > 2400) fail(`media/${f} is ${meta.width}×${meta.height} (max 2400)`);
	}
}

// Redirects
const redirects = existsSync(`${OUT}/_redirects`) ? await readFile(`${OUT}/_redirects`, 'utf8') : '';
for (const r of content.redirects) if (!redirects.includes(`${r.fromPath} ${r.toPath} ${r.status}`)) fail(`_redirects is missing ${r.fromPath}`);

// Headers
const headers = existsSync(`${OUT}/_headers`) ? await readFile(`${OUT}/_headers`, 'utf8') : '';
for (const h of ['Strict-Transport-Security', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', "frame-ancestors 'none'"])
	if (!headers.includes(h)) fail(`_headers is missing ${h}`);

// No secret in the client bundle
const secretNames = [
	'DATABASE_URL',
	'DATABASE_URL_BUILD',
	'STORAGE_SECRET_ACCESS_KEY',
	'STORAGE_READ_SECRET',
	'BETTER_AUTH_SECRET',
	'ADMIN_GATE_PASSWORD',
	'BREVO_API_KEY',
	'DEPLOY_HOOK_URL',
	'TURNSTILE_SECRET',
	'CRON_SECRET'
];
const secretValues = secretNames.map((n) => process.env[n]).filter((v): v is string => !!v && v.length >= 8);
async function walk(dir: string): Promise<string[]> {
	const out: string[] = [];
	for (const e of await readdir(dir, { withFileTypes: true })) {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) out.push(...(await walk(p)));
		else if (/\.(js|html|json|css)$/.test(e.name)) out.push(p);
	}
	return out;
}
for (const f of await walk(`${OUT}/_app`)) {
	const text = await readFile(f, 'utf8');
	for (const v of secretValues) if (text.includes(v)) fail(`a secret value appears in ${f}`);
	if (/postgres(ql)?:\/\/[^"'\s]+:[^"'\s]+@/.test(text)) fail(`a database URL appears in ${f}`);
}

// Legal: the company number
if (!content.settings.company.companyNumber) warnings.push('The company number (ondernemingsnummer) is empty. Belgian law requires it on the site.');

for (const w of warnings) console.warn(`⚠ ${w}`);
if (errors.length) {
	console.error(`\nverify-build: ${errors.length} problem(s)`);
	for (const e of errors) console.error(`  ✗ ${e}`);
	process.exit(1);
}
console.log(`verify-build: ${routes.length} routes checked, all good.`);
