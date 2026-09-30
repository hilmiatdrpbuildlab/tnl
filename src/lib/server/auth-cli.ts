/** Entry point for `npm run auth:generate` (Better Auth CLI). Never imported by the app. */
import { createDb } from './db/client';
import { createAuth } from './auth-config';

export const auth = createAuth({
	db: createDb(process.env.DATABASE_URL ?? 'postgres://cli:cli@localhost/cli'),
	secret: 'cli-only-secret-cli-only-secret-000',
	baseURL: 'http://localhost:5173',
	sendOtp: async () => {}
});
