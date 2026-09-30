/** Server-side checks for an uploaded image (after the browser scaled it). */
import { extensionFor, imageSize, sniffImageType, type ImageType } from '../image-info';
import { MAX_LONG_SIDE, MAX_STORED_BYTES, UPLOAD_ERRORS } from '../../media-rules';

export type CheckedUpload =
	| { ok: true; bytes: Uint8Array; type: ImageType; width: number; height: number; ext: string; fileName: string }
	| { ok: false; status: number; error: string };

export async function checkUpload(file: FormDataEntryValue | null): Promise<CheckedUpload> {
	if (!(file instanceof File)) return { ok: false, status: 400, error: UPLOAD_ERRORS.unreadable };
	if (file.size > MAX_STORED_BYTES) return { ok: false, status: 413, error: UPLOAD_ERRORS.tooLarge };
	const bytes = new Uint8Array(await file.arrayBuffer());
	// The type comes from the bytes, never from the file name or the browser's claim. No SVG.
	const type = sniffImageType(bytes);
	if (!type) return { ok: false, status: 415, error: UPLOAD_ERRORS.type };
	const size = imageSize(bytes, type);
	if (!size || !size.width || !size.height) return { ok: false, status: 400, error: UPLOAD_ERRORS.unreadable };
	if (Math.max(size.width, size.height) > MAX_LONG_SIDE) return { ok: false, status: 400, error: UPLOAD_ERRORS.dimensions };
	const ext = extensionFor(type);
	const fileName = (file.name || `foto.${ext}`).replace(/[^\w.\- ]+/g, '').slice(0, 120) || 'foto';
	return { ok: true, bytes, type, width: size.width, height: size.height, ext, fileName };
}
