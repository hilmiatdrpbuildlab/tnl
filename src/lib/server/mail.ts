/**
 * Brevo transactional e-mail (login codes, new-message notifications). Plain text plus a
 * minimal, escaped HTML part: customer text is never inserted as raw HTML.
 */
export interface MailConfig {
	apiKey: string;
	from: string;
	fromName: string;
}

export interface Mail {
	to: { email: string; name?: string }[];
	subject: string;
	text: string;
	replyTo?: { email: string; name?: string };
}

export const escapeHtml = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function textToHtml(text: string): string {
	return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#2b2e1d">${escapeHtml(text).replace(/\n/g, '<br>')}</div>`;
}

export async function sendMail(cfg: MailConfig, mail: Mail, fetcher: typeof fetch = fetch): Promise<void> {
	if (!cfg.apiKey) {
		// Local development without a Brevo key: print instead of sending.
		console.log(`[mail:dev] to=${mail.to.map((t) => t.email).join(',')} subject="${mail.subject}"\n${mail.text}`);
		return;
	}
	const res = await fetcher('https://api.brevo.com/v3/smtp/email', {
		method: 'POST',
		headers: { 'api-key': cfg.apiKey, 'content-type': 'application/json', accept: 'application/json' },
		body: JSON.stringify({
			sender: { email: cfg.from, name: cfg.fromName },
			to: mail.to,
			subject: mail.subject,
			textContent: mail.text,
			htmlContent: textToHtml(mail.text),
			...(mail.replyTo ? { replyTo: mail.replyTo } : {})
		})
	});
	if (!res.ok) throw new Error(`Brevo ${res.status}: ${(await res.text()).slice(0, 300)}`);
}
