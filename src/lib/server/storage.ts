/**
 * Neon Object Storage through the AWS S3 SDK (docs/cms-plan/04-media.md). Every bucket call in
 * the app goes through this file, so moving to Cloudflare R2 means only a new endpoint and new
 * credentials. Neon requires path-style addressing.
 */
import {
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client
} from '@aws-sdk/client-s3';

export interface StorageConfig {
	endpoint: string;
	bucket: string;
	accessKeyId: string;
	secretAccessKey: string;
	region?: string;
}

export interface Storage {
	put(key: string, body: Uint8Array, contentType: string): Promise<void>;
	get(key: string): Promise<{ body: Uint8Array; contentType: string } | null>;
	delete(key: string): Promise<void>;
	exists(key: string): Promise<boolean>;
	list(prefix?: string): Promise<string[]>;
}

export function createStorage(cfg: StorageConfig): Storage {
	const client = new S3Client({
		endpoint: cfg.endpoint,
		region: cfg.region ?? 'auto',
		forcePathStyle: true,
		credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey }
	});
	const Bucket = cfg.bucket;

	return {
		async put(key, body, contentType) {
			await client.send(
				new PutObjectCommand({
					Bucket,
					Key: key,
					Body: body,
					ContentType: contentType,
					CacheControl: 'private, max-age=31536000, immutable'
				})
			);
		},
		async get(key) {
			try {
				const res = await client.send(new GetObjectCommand({ Bucket, Key: key }));
				if (!res.Body) return null;
				const body = await res.Body.transformToByteArray();
				return { body, contentType: res.ContentType ?? 'application/octet-stream' };
			} catch (e) {
				if (isNotFound(e)) return null;
				throw e;
			}
		},
		async delete(key) {
			await client.send(new DeleteObjectCommand({ Bucket, Key: key }));
		},
		async exists(key) {
			try {
				await client.send(new HeadObjectCommand({ Bucket, Key: key }));
				return true;
			} catch (e) {
				if (isNotFound(e)) return false;
				throw e;
			}
		},
		async list(prefix = '') {
			const keys: string[] = [];
			let token: string | undefined;
			do {
				const res = await client.send(
					new ListObjectsV2Command({ Bucket, Prefix: prefix, ContinuationToken: token })
				);
				for (const o of res.Contents ?? []) if (o.Key) keys.push(o.Key);
				token = res.IsTruncated ? res.NextContinuationToken : undefined;
			} while (token);
			return keys;
		}
	};
}

function isNotFound(e: unknown) {
	const err = e as { name?: string; $metadata?: { httpStatusCode?: number } };
	return err?.name === 'NoSuchKey' || err?.name === 'NotFound' || err?.$metadata?.httpStatusCode === 404;
}

/** In-memory storage for unit tests and for local development without bucket credentials. */
export function createMemoryStorage(): Storage & { objects: Map<string, { body: Uint8Array; contentType: string }> } {
	const objects = new Map<string, { body: Uint8Array; contentType: string }>();
	return {
		objects,
		async put(key, body, contentType) {
			objects.set(key, { body, contentType });
		},
		async get(key) {
			return objects.get(key) ?? null;
		},
		async delete(key) {
			objects.delete(key);
		},
		async exists(key) {
			return objects.has(key);
		},
		async list(prefix = '') {
			return [...objects.keys()].filter((k) => k.startsWith(prefix));
		}
	};
}
