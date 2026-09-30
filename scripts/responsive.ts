/**
 * Responsive and accessibility checks (docs/cms-plan/11-testing-and-handover.md), modelled on
 * One Man Agency's responsive.mjs, plus axe-core:
 *   no horizontal overflow at 320–1440 px · tap targets at least 24 × 24 px · nav collapses
 *   under 980 px · no serious or critical axe issues · no console errors (CSP included).
 *
 *   E2E_BASE=https://tnl-website.<account>.workers.dev npm run e2e:responsive
 *   (add E2E_STORAGE_STATE and E2E_GATE to include the CMS screens)
 */
import { AxeBuilder } from '@axe-core/playwright';
import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';

const BASE = (process.env.E2E_BASE ?? 'http://127.0.0.1:8787').replace(/\/$/, '');
const WIDTHS = [320, 375, 430, 768, 1024, 1440];
const PUBLIC = (process.env.E2E_PATHS ?? '/,/diensten,/diensten/aanleg,/projecten,/projecten/tuinrenovatie-grind-en-gazon,/over-ons,/contact,/blog,/bedankt,/404').split(',');
const ADMIN = ['/admin', '/admin/projecten', '/admin/projecten/nieuw', '/admin/media', '/admin/berichten', '/admin/instellingen'];
const gate = process.env.E2E_GATE?.split(':');
const state = process.env.E2E_STORAGE_STATE;
const withAdmin = !!state && existsSync(state);

const problems: string[] = [];
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });

for (const width of WIDTHS) {
	const ctx = await browser.newContext({
		baseURL: BASE,
		viewport: { width, height: 900 },
		httpCredentials: gate ? { username: gate[0]!, password: gate[1]! } : undefined,
		storageState: withAdmin ? state : undefined
	});
	const page = await ctx.newPage();
	const errors: string[] = [];
	page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
	for (const path of [...PUBLIC, ...(withAdmin ? ADMIN : [])]) {
		errors.length = 0;
		await page.goto(path, { waitUntil: 'networkidle' });
		const where = `${path} @${width}`;
		const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
		if (overflow > 0) problems.push(`${where}: horizontal overflow of ${overflow}px`);

		const small = await page.evaluate(() =>
			[...document.querySelectorAll<HTMLElement>('a[href], button, input:not([type=hidden]), select, textarea, summary')]
				.filter((el) => {
					const r = el.getBoundingClientRect();
					const s = getComputedStyle(el);
					if (!r.width || !r.height || s.visibility === 'hidden' || el.closest('[hidden], dialog:not([open]), .l-hp, .adm-sr, .l-skip')) return false;
					// Inline links inside running text are exempt (WCAG 2.5.8)
					if (el.tagName === 'A' && s.display === 'inline' && el.closest('p, li, dd')) return false;
					return r.width < 24 || r.height < 24;
				})
				.map((el) => `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}"`)
		);
		for (const s of small.slice(0, 5)) problems.push(`${where}: tap target under 24×24: ${s}`);

		if (!path.startsWith('/admin')) {
			const navVisible = await page.locator('.tnl-nav').first().isVisible();
			if (width < 980 && navVisible) problems.push(`${where}: the nav should collapse under 980 px`);
			if (width >= 1024 && !navVisible) problems.push(`${where}: the nav should show at ${width} px`);
		}

		if (width === 375 || width === 1440) {
			const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
			for (const v of axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'))
				problems.push(`${where}: axe ${v.impact} ${v.id} (${v.nodes.length}×): ${v.help}`);
		}
		for (const e of errors.filter((e) => !/favicon/.test(e))) problems.push(`${where}: console error: ${e.slice(0, 160)}`);
	}
	await ctx.close();
}
await browser.close();

if (problems.length) {
	console.error(`${problems.length} problem(s):`);
	for (const p of problems) console.error(`  ✗ ${p}`);
	process.exit(1);
}
console.log(`✓ ${PUBLIC.length + (withAdmin ? ADMIN.length : 0)} pages × ${WIDTHS.length} widths: no overflow, tap targets OK, nav collapses, no serious axe issues, no console errors.`);
