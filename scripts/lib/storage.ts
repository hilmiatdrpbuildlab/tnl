/**
 * Storage for scripts: the Neon bucket when STORAGE_ENDPOINT is set, else the local folder.
 * Pull-request preview builds use the `*_PREVIEW` values (the dev branch's bucket) when set.
 */
import { createStorage, type Storage } from '../../src/lib/server/storage';
import { createFsStorage } from '../../src/lib/server/storage-fs';

const isPreview = !!process.env.WORKERS_CI_BRANCH && process.env.WORKERS_CI_BRANCH !== 'main';
const v = (name: string) => (isPreview && process.env[`${name}_PREVIEW`]) || process.env[name];

export function scriptStorage(mode: 'read' | 'write'): Storage {
	const endpoint = v('STORAGE_ENDPOINT');
	if (!endpoint) return createFsStorage('.local-bucket');
	const read = mode === 'read';
	const accessKeyId = (read ? v('STORAGE_READ_KEY_ID') : undefined) ?? v('STORAGE_ACCESS_KEY_ID');
	const secretAccessKey = (read ? v('STORAGE_READ_SECRET') : undefined) ?? v('STORAGE_SECRET_ACCESS_KEY');
	if (!accessKeyId || !secretAccessKey) throw new Error('Storage credentials are not set.');
	return createStorage({ endpoint, bucket: v('STORAGE_BUCKET') ?? 'media', accessKeyId, secretAccessKey });
}
