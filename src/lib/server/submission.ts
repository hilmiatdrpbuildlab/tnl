/** Contact form: validation, spam checks and the notification mail. */
import { z } from 'zod';

export const submissionSchema = z.object({
	voornaam: z.string().trim().min(1, 'Vul uw voornaam in.').max(100),
	achternaam: z.string().trim().max(100).optional().default(''),
	email: z
		.string()
		.trim()
		.max(200)
		.pipe(z.email({ error: 'Vul een geldig e-mailadres in, bijvoorbeeld naam@voorbeeld.be.' })),
	onderwerp: z.string().trim().max(200).optional().default(''),
	bericht: z.string().trim().min(1, 'Schrijf kort waarmee we u kunnen helpen.').max(5000)
});

export type SubmissionInput = z.infer<typeof submissionSchema>;

export function parseSubmission(form: FormData) {
	const get = (k: string) => {
		const v = form.get(k);
		return typeof v === 'string' ? v : undefined;
	};
	return submissionSchema.safeParse({
		voornaam: get('voornaam'),
		achternaam: get('achternaam') || undefined,
		email: get('email'),
		onderwerp: get('onderwerp') || undefined,
		bericht: get('bericht')
	});
}

/** The honeypot is a text field hidden from people. Anything in it means a bot. */
export const isHoneypotFilled = (form: FormData) => {
	const v = form.get('website');
	return typeof v === 'string' && v.trim().length > 0;
};

/** Strip line breaks from anything that goes into a mail header (subject, names). */
export const headerSafe = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

export function notificationMail(s: SubmissionInput) {
	const name = headerSafe(`${s.voornaam} ${s.achternaam}`.trim());
	const subject = headerSafe(s.onderwerp ? `Nieuw bericht: ${s.onderwerp}` : `Nieuw bericht van ${name}`).slice(0, 180);
	const text = [
		`Nieuw bericht via het contactformulier op de website.`,
		``,
		`Naam: ${name}`,
		`E-mail: ${s.email}`,
		s.onderwerp ? `Onderwerp: ${s.onderwerp}` : null,
		``,
		s.bericht,
		``,
		`--`,
		`Antwoord rechtstreeks op deze e-mail om de klant te antwoorden.`,
		`Alle berichten staan ook in het CMS onder Berichten.`
	]
		.filter((l) => l !== null)
		.join('\n');
	return { subject, text, replyTo: { email: s.email, name } };
}

export async function verifyTurnstile(token: string, secret: string, ip: string, fetcher: typeof fetch = fetch) {
	const body = new FormData();
	body.set('secret', secret);
	body.set('response', token);
	if (ip) body.set('remoteip', ip);
	const res = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
	if (!res.ok) return false;
	const data = (await res.json()) as { success?: boolean };
	return !!data.success;
}
