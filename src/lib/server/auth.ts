/** Better Auth for the running app: built per request from the Worker's env. */
import { getRequestEvent } from '$app/server';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { createAuth, OTP_PERIOD_MINUTES, type Auth } from './auth-config';
import { getDb } from './db';
import { env, isPreviewBuild, mailConfig, mailReplyTo } from './env';
import { sendMail } from './mail';

let cached: { key: string; auth: Auth } | null = null;

export async function getAuth(): Promise<Auth> {
	const secret = env.BETTER_AUTH_SECRET;
	// Preview URLs change per version: trust the request's own origin there.
	const baseURL = isPreviewBuild() ? getRequestEvent().url.origin : env.BETTER_AUTH_URL;
	if (!secret || secret.length < 32) throw new Error('BETTER_AUTH_SECRET must be at least 32 characters');
	if (!baseURL) throw new Error('BETTER_AUTH_URL is not set');
	const key = `${baseURL}|${env.DATABASE_URL}`;
	if (cached?.key === key) return cached.auth;
	const auth = createAuth({
		db: await getDb(),
		secret,
		baseURL,
		extraPlugins: [sveltekitCookies(getRequestEvent)],
		sendOtp: async (to, code) => {
			await sendMail(mailConfig(), {
				to: [{ email: to.email, name: to.name }],
				replyTo: { email: mailReplyTo() },
				subject: `Uw inlogcode: ${code}`,
				text: [
					`Uw code om in te loggen op het CMS van TNL Group:`,
					``,
					`    ${code}`,
					``,
					`De code is ${OTP_PERIOD_MINUTES} minuten geldig. Heeft u niet geprobeerd in te loggen? Negeer dan deze e-mail en laat het ons weten.`
				].join('\n')
			});
		}
	});
	cached = { key, auth };
	return auth;
}
