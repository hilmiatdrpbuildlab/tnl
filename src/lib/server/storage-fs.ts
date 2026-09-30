/**
 * A folder standing in for the bucket in local development and tests (Node only), used when
 * STORAGE_ENDPOINT is not set. Never used on Workers.
 */
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Storage } from './storage';

export function createFsStorage(root: string): Storage {
	const file = (key: string) => {
		const p = path.resolve(root, key);
		if (!p.startsWith(path.resolve(root))) throw new Error('Invalid key');
		return p;
	};
	return {
		async put(key, body) {
			await mkdir(path.dirname(file(key)), { recursive: true });
			await writeFile(file(key), body);
		},
		async get(key) {
			try {
				const body = new Uint8Array(await readFile(file(key)));
				const ext = key.split('.').pop();
				const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
				return { body, contentType };
			} catch {
				return null;
			}
		},
		async delete(key) {
			await rm(file(key), { force: true });
		},
		async exists(key) {
			return stat(file(key)).then(
				() => true,
				() => false
			);
		},
		async list(prefix = '') {
			const out: string[] = [];
			async function walk(dir: string) {
				for (const e of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
					const p = path.join(dir, e.name);
					if (e.isDirectory()) await walk(p);
					else out.push(path.relative(root, p).split(path.sep).join('/'));
				}
			}
			await walk(root);
			return out.filter((k) => k.startsWith(prefix));
		}
	};
}
