/**
 * Bundles src/lib/enhance/site.ts into static/site.<hash>.js (content-hashed, cached forever)
 * and records the file name in src/lib/generated/site-js.json for the public layout.
 */
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';

const out = await build({
	entryPoints: ['src/lib/enhance/site.ts'],
	bundle: true,
	minify: true,
	format: 'iife',
	target: ['es2020'],
	write: false
});
const code = out.outputFiles[0]!.text;
const hash = createHash('sha256').update(code).digest('hex').slice(0, 10);
const name = `site.${hash}.js`;
for (const f of await readdir('static')) if (/^site\.[0-9a-f]+\.js$/.test(f) && f !== name) await rm(`static/${f}`);
await writeFile(`static/${name}`, code);
await mkdir('src/lib/generated', { recursive: true });
await writeFile('src/lib/generated/site-js.json', JSON.stringify({ src: `/${name}` }) + '\n');
console.log(`static/${name}: ${(code.length / 1024).toFixed(1)} kB`);
