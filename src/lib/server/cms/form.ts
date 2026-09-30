/** Small readers for FormData in CMS actions. */
export const str = (f: FormData, k: string) => {
	const v = f.get(k);
	return typeof v === 'string' ? v.trim() : '';
};
export const optStr = (f: FormData, k: string) => str(f, k) || null;
export const bool = (f: FormData, k: string) => ['on', 'true', '1'].includes(str(f, k));
export const int = (f: FormData, k: string, fallback = 0) => {
	const n = Number.parseInt(str(f, k), 10);
	return Number.isFinite(n) ? n : fallback;
};
export const uuidOrNull = (f: FormData, k: string) => {
	const v = str(f, k);
	return /^[0-9a-f-]{36}$/i.test(v) ? v : null;
};
export function jsonField<T>(f: FormData, k: string, fallback: T): T {
	try {
		const v = str(f, k);
		return v ? (JSON.parse(v) as T) : fallback;
	} catch {
		return fallback;
	}
}

/** Zod issues → { field: message } for the form. */
export function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
	const out: Record<string, string> = {};
	for (const i of issues) out[String(i.path.join('.')) || '_'] ??= i.message;
	return out;
}
