/**
 * Creates the one CMS account, or resets its password (docs/cms-plan/05-cms.md).
 * Public sign-up is off in the app; only this script creates the account. The two-factor
 * row is created too, so every sign-in asks for the e-mailed code (and lockout can count).
 *
 *   ADMIN_EMAIL=grouptnl@outlook.com npm run seed:account -- --name "TNL Group"
 *   ADMIN_EMAIL=... npm run seed:account -- --reset        (new password for an existing account)
 *
 * A strong password is generated and printed once; pass --password to choose one.
 */
import './lib/env';
import { need } from './lib/env';
import { eq } from 'drizzle-orm';
import { createAuth } from '../src/lib/server/auth-config';
import { createNodeDb } from '../src/lib/server/db/client-node';
import * as t from '../src/lib/server/db/schema';

const arg = (k: string) => {
	const i = process.argv.indexOf(`--${k}`);
	return i > 0 ? process.argv[i + 1] : undefined;
};
const email = need('ADMIN_EMAIL').toLowerCase();
const reset = process.argv.includes('--reset');
const password =
	arg('password') ??
	Array.from(crypto.getRandomValues(new Uint8Array(18)), (b) => 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 56]).join('');
if (password.length < 12) throw new Error('The password needs at least 12 characters.');

const { db, close } = createNodeDb(need('DATABASE_URL'));
const auth = createAuth({
	db,
	secret: need('BETTER_AUTH_SECRET'),
	baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:5173',
	allowSignUp: true,
	sendOtp: async () => {}
});
const ctx = await auth.$context;
const [existing] = await db.select().from(t.user).where(eq(t.user.email, email)).limit(1);

let userId: string;
if (existing) {
	if (!reset) {
		console.error(`An account for ${email} exists. Use --reset to set a new password.`);
		process.exit(1);
	}
	userId = existing.id;
	const hash = await ctx.password.hash(password);
	await ctx.internalAdapter.updatePassword(userId, hash);
	await db.delete(t.session).where(eq(t.session.userId, userId));
	await db.update(t.twoFactor).set({ failedVerificationCount: 0, lockedUntil: null }).where(eq(t.twoFactor.userId, userId));
	console.log(`Password reset for ${email}; all sessions signed out and any lockout cleared.`);
} else {
	const res = await auth.api.signUpEmail({ body: { email, password, name: arg('name') ?? 'TNL Group' } });
	userId = res.user.id;
	await db.update(t.user).set({ emailVerified: true }).where(eq(t.user.id, userId));
	console.log(`Account created for ${email}.`);
}

// Second factor by e-mail on every sign-in. The TOTP secret is unused (OTP only).
await db.update(t.user).set({ twoFactorEnabled: true }).where(eq(t.user.id, userId));
const [tf] = await db.select().from(t.twoFactor).where(eq(t.twoFactor.userId, userId)).limit(1);
if (!tf) {
	await db.insert(t.twoFactor).values({
		id: crypto.randomUUID(),
		userId,
		secret: crypto.randomUUID(),
		backupCodes: '[]',
		verified: true
	});
}
await db.delete(t.session).where(eq(t.session.userId, userId));
console.log(`\n  E-mail:     ${email}\n  Wachtwoord: ${password}\n\nSend the password separately from the gate credentials (see HANDOVER.md).`);
await close();
