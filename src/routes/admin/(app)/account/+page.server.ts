import { fail, redirect } from '@sveltejs/kit';
import { getAuth } from '$lib/server/auth';
import { str } from '$lib/server/cms/form';
import { requireUser } from '$lib/server/cms/guard';

export const actions = {
	password: async ({ request, locals }) => {
		requireUser(locals);
		const f = await request.formData();
		const current = str(f, 'current');
		const next = str(f, 'next');
		if (next.length < 12) return fail(400, { errors: { next: 'Kies een wachtwoord van minstens 12 tekens.' } });
		if (next !== str(f, 'repeat')) return fail(400, { errors: { repeat: 'De twee wachtwoorden zijn niet gelijk.' } });
		try {
			const auth = await getAuth();
			await auth.api.changePassword({ body: { currentPassword: current, newPassword: next, revokeOtherSessions: true }, headers: request.headers });
		} catch {
			return fail(400, { errors: { current: 'Het huidige wachtwoord klopt niet.' } });
		}
		return { saved: true };
	},
	logout: async ({ request, locals }) => {
		requireUser(locals);
		const auth = await getAuth();
		await auth.api.signOut({ headers: request.headers }).catch(() => {});
		redirect(303, '/admin/login');
	}
};
