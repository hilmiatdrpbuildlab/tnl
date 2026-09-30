/** Quote a CSV cell and defuse formulas (=, +, -, @) against CSV injection in Excel. */
export function csvCell(v: unknown): string {
	let s = v == null ? '' : String(v);
	if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
	return `"${s.replace(/"/g, '""')}"`;
}
