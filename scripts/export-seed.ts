/**
 * Writes scripts/seed.json from seed-data.ts: the build's fallback content when
 * DATABASE_URL_BUILD is not set (local development, CI). Commit the result.
 *   npm run export-seed
 */
import { writeFile } from 'node:fs/promises';
import { buildSeedRows } from './lib/seed-rows';

const { rows, files } = await buildSeedRows();
await writeFile('scripts/seed.json', JSON.stringify({ rows, files }, null, '\t') + '\n');
console.log(`scripts/seed.json written: ${rows.media.length} photos, ${rows.projects.length} projects.`);
