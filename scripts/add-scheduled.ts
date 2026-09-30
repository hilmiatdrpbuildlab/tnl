/**
 * Build step 4: adds the daily cron handler to the Worker the SvelteKit adapter wrote.
 * The adapter only exports `fetch`; this appends `scheduled`, which calls POST /api/cron inside
 * the same Worker with CRON_SECRET. The cron itself is in wrangler.jsonc (0 3 * * *).
 */
import { readFile, writeFile } from 'node:fs/promises';

const file = '.svelte-kit/cloudflare/_worker.js';
const src = await readFile(file, 'utf8');
const marker = '/* tnl:scheduled */';
if (src.includes(marker)) {
	console.log('scheduled handler already present');
	process.exit(0);
}
const m = src.match(/export\s*\{\s*(\w+)\s+as\s+default\s*\}/);
if (!m) throw new Error(`Could not find the default export in ${file}; check the adapter version.`);
const name = m[1];
const addition = `
${marker}
${name}.scheduled = async function (controller, env, ctx) {
	const req = new Request('https://cron.internal/api/cron', {
		method: 'POST',
		headers: { 'x-cron-secret': env.CRON_SECRET ?? '', 'content-type': 'application/json' }
	});
	ctx.waitUntil(
		${name}.fetch(req, env, ctx).then(async (res) => {
			if (!res.ok) console.error('cron failed', res.status, await res.text());
		})
	);
};
`;
await writeFile(file, src + addition);
console.log(`scheduled handler added to ${file}`);
