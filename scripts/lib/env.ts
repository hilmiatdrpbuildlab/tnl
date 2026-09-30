/** Loads .dev.vars (then .env) for scripts run with tsx, the same file wrangler dev reads. */
import { config } from 'dotenv';
import { existsSync } from 'node:fs';

for (const f of ['.dev.vars', '.env']) if (existsSync(f)) config({ path: f, quiet: true });

export function need(name: string): string {
	const v = process.env[name];
	if (!v) {
		console.error(`Missing ${name}. Set it in .dev.vars or the environment.`);
		process.exit(1);
	}
	return v;
}
