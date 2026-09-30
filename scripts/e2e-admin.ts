/**
 * CMS end to end (docs/cms-plan/11-testing-and-handover.md), modelled on One Man Agency's
 * admin-e2e.mjs. Uses throwaway rows only ("E2E …") and removes them again.
 *
 *   Local:   E2E_BASE=http://localhost:5173 E2E_OTP_LOG=/tmp/vd.log npm run e2e:admin
 *            (the dev server prints login codes to its log when BREVO_API_KEY is empty)
 *   Preview: E2E_BASE=https://<preview>.workers.dev E2E_GATE=user:pass E2E_STORAGE_STATE=state.json
 *            (sign in once by hand with "Dit toestel onthouden" and save the storage state)
 *
 * Env: ADMIN_EMAIL, E2E_PASSWORD (unless E2E_STORAGE_STATE), E2E_LOCAL=1 to simulate the live
 * build-info.json in static/ (dev server only).
 */
import './lib/env';
import { chromium, type Page } from '@playwright/test';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';

const BASE = (process.env.E2E_BASE ?? 'http://localhost:5173').replace(/\/$/, '');
const gate = process.env.E2E_GATE?.split(':');
const results: { name: string; ok: boolean; detail?: string }[] = [];

async function step(name: string, fn: () => Promise<void>) {
	try {
		await fn();
		results.push({ name, ok: true });
		console.log(`✓ ${name}`);
	} catch (e) {
		results.push({ name, ok: false, detail: String(e instanceof Error ? e.message : e) });
		console.log(`✗ ${name}\n    ${e instanceof Error ? e.message : e}`);
	}
}
function assert(cond: unknown, msg: string): asserts cond {
	if (!cond) throw new Error(msg);
}

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const context = await browser.newContext({
	baseURL: BASE,
	httpCredentials: gate ? { username: gate[0]!, password: gate[1]! } : undefined,
	storageState: process.env.E2E_STORAGE_STATE && existsSync(process.env.E2E_STORAGE_STATE) ? process.env.E2E_STORAGE_STATE : undefined
});
const page = await context.newPage();
const consoleErrors: string[] = [];
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));

async function readOtp(since: number): Promise<string> {
	const log = process.env.E2E_OTP_LOG;
	if (!log) throw new Error('Set E2E_OTP_LOG or E2E_STORAGE_STATE');
	for (let i = 0; i < 40; i++) {
		const text = (await readFile(log, 'utf8')).slice(since);
		const all = [...text.matchAll(/Uw inlogcode: (\d{6})/g)];
		if (all.length) return all[all.length - 1]![1]!;
		await new Promise((r) => setTimeout(r, 250));
	}
	throw new Error('No login code in the log');
}

await step('anonymous /admin is refused (401 with the gate, else the login page)', async () => {
	const anon = await browser.newContext({ baseURL: BASE });
	const res = await anon.request.get('/admin', { maxRedirects: 0 });
	if (gate) {
		assert(res.status() === 401, `expected 401, got ${res.status()}`);
		const body = await res.text();
		assert(!/TNL|login|inloggen/i.test(body), 'the 401 must not be branded');
	} else {
		assert([302, 303].includes(res.status()), `expected a redirect to the login, got ${res.status()}`);
	}
	await anon.close();
});

async function signIn(p: Page) {
	await p.goto('/admin/login', { waitUntil: 'networkidle' });
	if (!p.url().includes('/login')) return; // storage state already signed in
	const logStart = process.env.E2E_OTP_LOG ? (await readFile(process.env.E2E_OTP_LOG, 'utf8')).length : 0;
	await p.fill('#email', process.env.ADMIN_EMAIL ?? '');
	await p.fill('#password', process.env.E2E_PASSWORD ?? '');
	await p.click('button[type=submit]');
	await p.waitForSelector('#code', { timeout: 15000 });
	return logStart;
}

let logStart: number | undefined;
await step('a wrong code is refused', async () => {
	logStart = await signIn(page);
	if (logStart === undefined) return; // already signed in through the storage state
	await page.fill('#code', '000000');
	await page.click('button[type=submit]');
	await page.waitForSelector('.adm-notice--bad');
	assert(page.url().includes('/admin/login'), 'still on the login page');
});

await step('sign in with e-mail, password and the e-mailed code', async () => {
	if (logStart !== undefined) {
		const code = await readOtp(logStart);
		await page.fill('#code', code);
		await page.click('button[type=submit]');
	}
	await page.waitForURL(/\/admin$/, { timeout: 15000 });
	await page.waitForSelector('h1:has-text("Overzicht")');
});

let projectUrl = '';
const title = `E2E project ${Date.now().toString(36)}`;
let firstCover = '';

async function uploadVia(p: Page, fieldLabel: string, file: string, alt: string) {
	const field = p.locator('.adm-img', { hasText: fieldLabel });
	await field.getByRole('button', { name: /Foto kiezen|Vervangen/ }).click();
	const dialog = p.locator('dialog[open]');
	await dialog.locator('input[type=file]').setInputFiles(file);
	await dialog.locator('#picker-alt').fill(alt);
	await dialog.getByRole('button', { name: 'Uploaden en kiezen' }).click();
	await p.waitForFunction(() => !document.querySelector('dialog[open]'));
	return field.locator('input[type=hidden]').inputValue();
}

await step('create a project with a photo (throwaway row)', async () => {
	await page.goto('/admin/projecten/nieuw', { waitUntil: 'networkidle' });
	await page.fill('#f-title', title);
	await page.fill('#f-summary', 'Testproject, wordt meteen weer verwijderd.');
	firstCover = await uploadVia(page, 'Hoofdfoto', 'seed/photos/aanleg-pad-haag.jpg', 'Testfoto één');
	assert(/^[0-9a-f-]{36}$/.test(firstCover), 'upload returned a media id');
	await page.getByTestId('save').click();
	await page.waitForURL(/\/admin\/projecten\/[0-9a-f-]{36}/);
	projectUrl = new URL(page.url()).pathname;
	await page.waitForSelector('text=Opgeslagen');
});

await step('the save counts as an unpublished change', async () => {
	const text = await page.locator('.adm-banner').innerText();
	assert(/wijziging/.test(text), `banner says: ${text}`);
});

await step('preview shows the draft with the real components', async () => {
	const slug = await page.inputValue('#f-slug');
	const res = await page.goto(`/admin/preview/projecten/${slug}`, { waitUntil: 'networkidle' });
	assert(res?.ok(), `preview answered ${res?.status()}`);
	await page.waitForSelector(`h1:has-text("${title}")`);
	assert(await page.locator('.tnl-hero').count(), 'uses the public Hero');
});

await step('replacing the photo deletes the old file', async () => {
	await page.goto(projectUrl, { waitUntil: 'networkidle' });
	const second = await uploadVia(page, 'Hoofdfoto', 'seed/photos/onderhoud-gazon.jpg', 'Testfoto twee');
	assert(second !== firstCover, 'a new file was picked');
	await page.getByTestId('save').click();
	await page.waitForSelector('text=Opgeslagen');
	const old = await page.request.get(`/admin/api/media/${firstCover}`);
	assert(old.status() === 404, `old file still served (${old.status()})`);
	const list = (await (await page.request.get('/admin/api/media')).json()) as { media: { id: string }[] };
	assert(!list.media.some((m) => m.id === firstCover), 'old media row still listed');
});

await step('a file still in use cannot be deleted from the media library', async () => {
	await page.goto('/admin/media', { waitUntil: 'networkidle' });
	const card = page.locator('figure', { hasText: 'Testfoto twee' });
	assert((await card.getByTestId('delete-open').count()) === 0, 'delete offered for a used file');
});

await step('deleting asks first, and cancelling keeps the item', async () => {
	await page.goto(projectUrl, { waitUntil: 'networkidle' });
	await page.getByTestId('delete-open').click();
	const dialog = page.locator('dialog[open]');
	await dialog.waitFor();
	assert((await dialog.innerText()).includes(title), 'the dialog names the item');
	await dialog.getByRole('button', { name: 'Annuleren' }).click();
	await page.goto(projectUrl, { waitUntil: 'networkidle' });
	await page.waitForSelector(`h1:has-text("${title}")`);
});

await step('deleting with confirmation removes the project and its unused photo', async () => {
	const cover = await page.locator('.adm-img', { hasText: 'Hoofdfoto' }).locator('input[type=hidden]').inputValue();
	await page.getByTestId('delete-open').click();
	await page.locator('dialog[open]').getByTestId('delete-confirm').click();
	await page.waitForURL(/\/admin\/projecten$/);
	assert(!(await page.locator(`text=${title}`).count()), 'project still listed');
	const res = await page.request.get(`/admin/api/media/${cover}`);
	assert(res.status() === 404, 'the photo of the deleted project is still there');
});

await step('publish: a double click starts one build, and Live only shows after build-info.json changes', async () => {
	await page.goto('/admin', { waitUntil: 'networkidle' });
	const btn = page.getByTestId('publish');
	const responses: string[] = [];
	page.on('response', async (r) => {
		if (r.url().endsWith('/admin/api/publish') && r.request().method() === 'POST') responses.push(((await r.json()) as { id: string }).id);
	});
	await btn.dblclick();
	await page.waitForTimeout(1500);
	assert(new Set(responses).size <= 1, `more than one build started: ${responses.join(', ')}`);
	await page.waitForSelector('text=Bezig met publiceren');
	if (process.env.E2E_LOCAL === '1' && responses[0]) {
		await writeFile('static/build-info.json', JSON.stringify({ buildId: 'e2e', publishId: responses[0] }));
		await page.waitForSelector('text=Live.', { timeout: 20000 });
	}
});

await step('no console errors (CSP included) on the CMS screens', async () => {
	consoleErrors.length = 0; // earlier steps expect some 4xx (the wrong code, deleted files)
	for (const p of ['/admin/paginas', '/admin/diensten', '/admin/projecten', '/admin/reviews', '/admin/faq', '/admin/cijfers', '/admin/blog', '/admin/media', '/admin/berichten', '/admin/seo', '/admin/instellingen', '/admin/account']) {
		const res = await page.goto(p, { waitUntil: 'load' });
		assert(res?.ok(), `${p} answered ${res?.status()}`);
	}
	const relevant = consoleErrors.filter((e) => !/favicon/.test(e));
	assert(!relevant.length, relevant.join('\n'));
});

if (process.env.E2E_SAVE_STATE) await context.storageState({ path: process.env.E2E_SAVE_STATE });
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
