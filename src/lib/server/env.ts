/** Typed access to the Worker's variables and secrets (docs/cms-plan/09-environments.md). */
import { env as rawEnv } from '$env/dynamic/private';
import { getBuild } from './content';

/**
 * Preview builds (pull requests) run as versions of the same Worker, with the same secrets.
 * So that no preview ever touches the client's content, a preview reads `<NAME>_PREVIEW`
 * (the Neon `dev` branch and its bucket) whenever that variable is set.
 */
export const isPreviewBuild = () => {
	const b = getBuild() as { branch?: string | null };
	return !!b.branch && b.branch !== 'main';
};
const PREVIEWABLE = ['DATABASE_URL', 'STORAGE_ENDPOINT', 'STORAGE_ACCESS_KEY_ID', 'STORAGE_SECRET_ACCESS_KEY', 'STORAGE_BUCKET'];
export const env: Record<string, string | undefined> = new Proxy(rawEnv as Record<string, string | undefined>, {
	get(target, name: string) {
		if (PREVIEWABLE.includes(name) && isPreviewBuild() && target[`${name}_PREVIEW`]) return target[`${name}_PREVIEW`];
		return target[name];
	}
});
import type { MailConfig } from './mail';
import { createStorage, type Storage } from './storage';

export function mailConfig(): MailConfig {
	return {
		apiKey: env.BREVO_API_KEY ?? '',
		from: env.MAIL_FROM || 'noreply@tnlgroup.be',
		fromName: env.MAIL_FROM_NAME || 'TNL Group'
	};
}

export const mailReplyTo = () => env.MAIL_REPLY_TO || 'grouptnl@outlook.com';

let storageCache: Storage | null = null;

/** The media bucket (read/write credential). Local dev without STORAGE_ENDPOINT uses .local-bucket/. */
export async function getStorage(): Promise<Storage> {
	if (storageCache) return storageCache;
	if (!env.STORAGE_ENDPOINT) {
		const { dev } = await import('$app/environment');
		if (!dev) throw new Error('STORAGE_ENDPOINT is not set');
		const { createFsStorage } = await import('./storage-fs');
		storageCache = createFsStorage('.local-bucket');
		return storageCache;
	}
	storageCache = createStorage({
		endpoint: env.STORAGE_ENDPOINT,
		bucket: env.STORAGE_BUCKET || 'media',
		accessKeyId: env.STORAGE_ACCESS_KEY_ID ?? '',
		secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY ?? ''
	});
	return storageCache;
}

