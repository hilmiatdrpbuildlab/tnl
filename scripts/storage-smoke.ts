/**
 * Phase 0 check for the bucket: uploads, reads and deletes a test file with the read/write
 * credential, and proves the read-only credential is refused a write.
 *   npm run storage:smoke
 */
import './lib/env';
import { need } from './lib/env';
import { createStorage } from '../src/lib/server/storage';

const endpoint = need('STORAGE_ENDPOINT');
const bucket = process.env.STORAGE_BUCKET ?? 'media';
const rw = createStorage({ endpoint, bucket, accessKeyId: need('STORAGE_ACCESS_KEY_ID'), secretAccessKey: need('STORAGE_SECRET_ACCESS_KEY') });
const ro = createStorage({ endpoint, bucket, accessKeyId: need('STORAGE_READ_KEY_ID'), secretAccessKey: need('STORAGE_READ_SECRET') });

const key = `smoke/${Date.now()}.txt`;
const body = new TextEncoder().encode('tnl smoke test');
await rw.put(key, body, 'text/plain');
const got = await ro.get(key);
if (!got || new TextDecoder().decode(got.body) !== 'tnl smoke test') throw new Error('read-back failed');
console.log('✓ read/write credential: upload OK; read-only credential: read OK');
let refused = false;
try {
	await ro.put(`${key}.ro`, body, 'text/plain');
} catch {
	refused = true;
}
await rw.delete(key);
if (await rw.exists(key)) throw new Error('delete failed');
console.log('✓ delete OK');
if (!refused) {
	await rw.delete(`${key}.ro`).catch(() => {});
	throw new Error('✗ the read-only credential was allowed to write');
}
console.log('✓ read-only credential refused a write');
