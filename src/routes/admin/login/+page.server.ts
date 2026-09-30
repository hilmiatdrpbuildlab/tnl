import { redirect } from '@sveltejs/kit';
import { OTP_RESEND_AFTER_SECONDS } from '$lib/server/auth-config';

export function load({ locals }) {
	if (locals.user) redirect(303, '/admin');
	return { resendAfter: OTP_RESEND_AFTER_SECONDS };
}
