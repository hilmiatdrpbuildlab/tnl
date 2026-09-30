import { error, redirect } from '@sveltejs/kit';

/** Every CMS load, action and endpoint calls this; the layout check alone is not enough. */
export function requireUser(locals: App.Locals, opts: { api?: boolean } = {}) {
	if (!locals.user || !locals.session) {
		if (opts.api) error(401, 'Niet ingelogd');
		redirect(303, '/admin/login');
	}
	return locals.user;
}
