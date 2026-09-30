/**
 * Image type sniffing and dimension reading from the file's bytes (never from the file name).
 * Runs on Workers, where sharp is not available. JPEG, PNG and WebP only; SVG is never accepted.
 */
export type ImageType = 'image/jpeg' | 'image/png' | 'image/webp';

export function sniffImageType(b: Uint8Array): ImageType | null {
	if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
	if (
		b.length >= 8 &&
		b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
		b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a
	)
		return 'image/png';
	if (
		b.length >= 12 &&
		b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
		b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
	)
		return 'image/webp';
	return null;
}

export function extensionFor(type: ImageType): string {
	return type === 'image/jpeg' ? 'jpg' : type === 'image/png' ? 'png' : 'webp';
}

export function imageSize(b: Uint8Array, type: ImageType): { width: number; height: number } | null {
	const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
	try {
		if (type === 'image/png') return { width: dv.getUint32(16), height: dv.getUint32(20) };
		if (type === 'image/webp') return webpSize(b, dv);
		return jpegSize(b, dv);
	} catch {
		return null;
	}
}

function jpegSize(b: Uint8Array, dv: DataView) {
	let i = 2;
	while (i + 9 < b.length) {
		if (b[i] !== 0xff) {
			i++;
			continue;
		}
		const marker = b[i + 1]!;
		// SOF0..SOF15 except DHT (C4), JPG (C8) and DAC (CC)
		if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
			return { height: dv.getUint16(i + 5), width: dv.getUint16(i + 7) };
		}
		if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
			i += 2;
			continue;
		}
		i += 2 + dv.getUint16(i + 2);
	}
	return null;
}

function webpSize(b: Uint8Array, dv: DataView) {
	const chunk = String.fromCharCode(b[12]!, b[13]!, b[14]!, b[15]!);
	if (chunk === 'VP8X') {
		const w = 1 + (b[24]! | (b[25]! << 8) | (b[26]! << 16));
		const h = 1 + (b[27]! | (b[28]! << 8) | (b[29]! << 16));
		return { width: w, height: h };
	}
	if (chunk === 'VP8 ') return { width: dv.getUint16(26, true) & 0x3fff, height: dv.getUint16(28, true) & 0x3fff };
	if (chunk === 'VP8L') {
		const bits = dv.getUint32(21, true);
		return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
	}
	return null;
}
