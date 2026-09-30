/**
 * Browser side of the upload flow (docs/cms-plan/04-media.md): check the type and size, scale to
 * at most 2400 px on the long side and re-encode as JPEG at quality 85. Re-encoding through a
 * canvas also drops EXIF data, including the GPS location of the client's customers.
 */
import { MAX_LONG_SIDE, MAX_UPLOAD_BYTES, UPLOAD_ERRORS } from '$lib/media-rules';

export interface UploadedMedia {
	id: string;
	width: number;
	height: number;
	alt: string;
	fileName: string;
	src: string;
}

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
export const ACCEPT_ATTR = ACCEPTED.join(',');

export class UploadError extends Error {}

export async function scaleImage(file: File): Promise<Blob> {
	if (!ACCEPTED.includes(file.type)) throw new UploadError(UPLOAD_ERRORS.type);
	if (file.size > MAX_UPLOAD_BYTES) throw new UploadError(UPLOAD_ERRORS.tooLarge);
	let bitmap: ImageBitmap;
	try {
		bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
	} catch {
		throw new UploadError(UPLOAD_ERRORS.unreadable);
	}
	const scale = Math.min(1, MAX_LONG_SIDE / Math.max(bitmap.width, bitmap.height));
	const w = Math.round(bitmap.width * scale);
	const h = Math.round(bitmap.height * scale);
	const canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new UploadError(UPLOAD_ERRORS.unreadable);
	ctx.fillStyle = '#ffffff'; // PNG transparency becomes white in the JPEG
	ctx.fillRect(0, 0, w, h);
	ctx.drawImage(bitmap, 0, 0, w, h);
	bitmap.close();
	const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.85));
	if (!blob) throw new UploadError(UPLOAD_ERRORS.unreadable);
	return blob;
}

export async function uploadImage(file: File, alt: string): Promise<UploadedMedia> {
	const blob = await scaleImage(file);
	const body = new FormData();
	body.set('file', blob, file.name.replace(/\.[^.]+$/, '') + '.jpg');
	body.set('alt', alt);
	const res = await fetch('/admin/api/media', { method: 'POST', body });
	const data = (await res.json().catch(() => ({}))) as { error?: string; media?: UploadedMedia };
	if (!res.ok || !data.media) throw new UploadError(data.error ?? 'Uploaden is mislukt. Probeer het opnieuw.');
	return data.media;
}
