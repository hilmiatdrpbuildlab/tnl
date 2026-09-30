/** CSV export of all contact messages (UTF-8 with BOM so Excel opens it correctly). */
import { desc } from 'drizzle-orm';
import { requireUser } from '$lib/server/cms/guard';
import { csvCell } from '$lib/server/cms/csv';
import { getDb, schema as t } from '$lib/server/db';

export async function GET({ locals }) {
	requireUser(locals, { api: true });
	const rows = await (await getDb()).select().from(t.submissions).orderBy(desc(t.submissions.createdAt));
	const head = ['Ontvangen', 'Voornaam', 'Achternaam', 'E-mail', 'Onderwerp', 'Bericht', 'Gelezen'];
	const lines = [head.map(csvCell).join(';')];
	for (const r of rows)
		lines.push([r.createdAt.toISOString(), r.firstName, r.lastName, r.email, r.subject, r.message, r.isRead ? 'ja' : 'nee'].map(csvCell).join(';'));
	const date = new Date().toISOString().slice(0, 10);
	return new Response('﻿' + lines.join('\r\n') + '\r\n', {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': `attachment; filename="berichten-${date}.csv"`,
			'cache-control': 'no-store'
		}
	});
}
