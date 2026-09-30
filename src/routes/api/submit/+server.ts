/**
 * Contact form POST (docs/cms-plan/06-public-site.md). Order:
 *   1. honeypot, Turnstile, rate limit   2. Zod   3. Brevo notification FIRST
 *   4. submissions row (notified_at set if the mail went out)   5. thank-you / redirect
 * The notification recipient comes from the published settings built into the Worker, so a
 * sleeping or over-quota Neon never loses a message.
 */
import { json, redirect, type RequestHandler } from '@sveltejs/kit';
import { getDb, schema } from '$lib/server/db';
import { getContent } from '$lib/server/content';
import { env, mailConfig } from '$lib/server/env';
import { sendMail } from '$lib/server/mail';
import { allowSubmission } from '$lib/server/ratelimit';
import { isHoneypotFilled, notificationMail, parseSubmission, verifyTurnstile } from '$lib/server/submission';

export const prerender = false;

export const POST: RequestHandler = async ({ request, platform, getClientAddress }) => {
	const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
	const done = (ok: boolean, status = 200, errors?: Record<string, string>) => {
		if (wantsJson) return json({ ok, ...(errors ? { errors } : {}) }, { status });
		redirect(303, ok ? '/bedankt' : '/formulier-fout');
	};

	let form: FormData;
	try {
		form = await request.formData();
	} catch {
		return done(false, 400);
	}

	// 1. Spam checks. A filled honeypot gets a normal-looking success and nothing else.
	if (isHoneypotFilled(form)) return done(true);

	const ip = request.headers.get('cf-connecting-ip') ?? safeClientAddress(getClientAddress);
	const secret = env.TURNSTILE_SECRET;
	if (secret) {
		const token = form.get('cf-turnstile-response');
		if (typeof token === 'string' && token) {
			if (!(await verifyTurnstile(token, secret, ip))) return done(false, 403);
		} else if (env.TURNSTILE_REQUIRE_TOKEN === '1') {
			// Without JavaScript there is no token. Off by default so the no-JS form still works.
			return done(false, 403);
		}
	}

	const allowed = await allowSubmission(ip, {
		binding: platform?.env?.SUBMIT_LIMITER,
		cache: platform?.caches?.default
	});
	if (!allowed) return done(false, 429);

	// 2. Validation
	const parsed = parseSubmission(form);
	if (!parsed.success) {
		const errors: Record<string, string> = {};
		for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
		return done(false, 400, errors);
	}
	const s = parsed.data;

	// 3. Notification first
	const settings = getContent().settings;
	const mail = notificationMail(s);
	let mailed = false;
	try {
		await sendMail(mailConfig(), {
			to: [{ email: settings.notifyEmail }],
			subject: mail.subject,
			text: mail.text,
			replyTo: mail.replyTo
		});
		mailed = true;
	} catch (e) {
		console.error('submit: notification failed', e);
	}

	// 4. The row. No IP address is stored.
	let stored = false;
	try {
		const db = await getDb();
		await db.insert(schema.submissions).values({
			firstName: s.voornaam,
			lastName: s.achternaam || null,
			email: s.email,
			subject: s.onderwerp || null,
			message: s.bericht,
			notifiedAt: mailed ? new Date() : null
		});
		stored = true;
	} catch (e) {
		console.error('submit: database write failed', e);
	}

	// 5. Only when both failed has the message not reached TNL.
	return done(mailed || stored, mailed || stored ? 200 : 503);
};

function safeClientAddress(get: () => string) {
	try {
		return get();
	} catch {
		return '';
	}
}
