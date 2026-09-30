/**
 * Better Auth configuration without any SvelteKit imports, so the CLI and the scripts can load it.
 * E-mail + password, public sign-up off, then a 6-digit code by e-mail (two-factor OTP).
 * See docs/cms-plan/05-cms.md.
 */
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { twoFactor } from 'better-auth/plugins';
import type { BetterAuthPlugin } from 'better-auth';
import type { Db } from './db/client';
import * as schema from './db/schema';

export const AUTH_BASE_PATH = '/admin/api/auth';
/** Login code: 6 digits, valid 5 minutes, device trusted 30 days. */
export const OTP_PERIOD_MINUTES = 5;
export const OTP_RESEND_AFTER_SECONDS = 60;
export const TRUST_DEVICE_DAYS = 30;

export interface AuthDeps {
	db: Db;
	secret: string;
	baseURL: string;
	sendOtp: (to: { email: string; name: string }, code: string) => Promise<void>;
	/** Only the seed-account script turns this on. */
	allowSignUp?: boolean;
	/** The SvelteKit cookie plugin, when running inside the app. */
	extraPlugins?: BetterAuthPlugin[];
	/** Sign in with the password alone. Local development only (AUTH_SKIP_OTP, see auth.ts). */
	skipOtp?: boolean;
}

export function createAuth({ db, secret, baseURL, sendOtp, allowSignUp = false, extraPlugins = [], skipOtp = false }: AuthDeps) {
	const secure = baseURL.startsWith('https://');
	return betterAuth({
		appName: 'TNL Group CMS',
		secret,
		baseURL,
		basePath: AUTH_BASE_PATH,
		trustedOrigins: [baseURL],
		database: drizzleAdapter(db, { provider: 'pg', schema, transaction: false }),
		emailAndPassword: {
			enabled: true,
			disableSignUp: !allowSignUp,
			minPasswordLength: 12,
			autoSignIn: false
		},
		session: {
			expiresIn: 60 * 60 * 24 * 7,
			updateAge: 60 * 60 * 24
		},
		rateLimit: { enabled: true, storage: 'database', window: 60, max: 30 },
		advanced: {
			cookiePrefix: 'tnl',
			useSecureCookies: secure,
			defaultCookieAttributes: {
				httpOnly: true,
				secure,
				sameSite: 'lax',
				path: '/admin'
			},
			database: { generateId: () => crypto.randomUUID() }
		},
		plugins: [
			...(skipOtp ? [] : [twoFactor({
				issuer: 'TNL Group',
				trustDeviceMaxAge: TRUST_DEVICE_DAYS * 24 * 60 * 60,
				otpOptions: {
					period: OTP_PERIOD_MINUTES,
					digits: 6,
					allowedAttempts: 5,
					storeOTP: 'hashed',
					async sendOTP({ user, otp }) {
						await sendOtp({ email: user.email, name: user.name }, otp);
					}
				},
				// Account lockout after repeated wrong codes stays on (plugin default).
				accountLockout: { enabled: true, maxFailedAttempts: 10, durationSeconds: 900 }
			})]),
			...extraPlugins
		]
	});
}

export type Auth = ReturnType<typeof createAuth>;
