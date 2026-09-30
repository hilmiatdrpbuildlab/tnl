/**
 * Sends TNL their CMS access in two separate e-mails, gate first (docs/cms-plan/09-environments.md),
 * modelled on One Man Agency's send_invite. Run once per step:
 *   npm run send-invite -- gate    (ADMIN_GATE_USER / ADMIN_GATE_PASSWORD)
 *   npm run send-invite -- login --password '<from seed-account>'
 */
import './lib/env';
import { need } from './lib/env';
import { sendMail } from '../src/lib/server/mail';

const step = process.argv[2];
const to = need('ADMIN_EMAIL');
const site = need('PUBLIC_SITE_URL').replace(/\/$/, '');
const cfg = { apiKey: need('BREVO_API_KEY'), from: process.env.MAIL_FROM ?? 'noreply@tnlgroup.be', fromName: 'TNL Group website' };

if (step === 'gate') {
	await sendMail(cfg, {
		to: [{ email: to }],
		subject: 'Uw nieuwe website: toegang (1 van 2)',
		text: [
			'Beste,',
			'',
			`Het beheer van uw website vindt u op ${site}/admin.`,
			'Uw browser vraagt eerst om een gebruikersnaam en wachtwoord. Dat is een extra slot voor het CMS:',
			'',
			`  Gebruikersnaam: ${need('ADMIN_GATE_USER')}`,
			`  Wachtwoord:     ${need('ADMIN_GATE_PASSWORD')}`,
			'',
			'In een tweede e-mail krijgt u uw eigen login. Bewaar beide goed en deel ze met niemand.',
			'',
			'Met vriendelijke groeten,',
			'DRP BuildLab'
		].join('\n')
	});
} else if (step === 'login') {
	const i = process.argv.indexOf('--password');
	const password = i > 0 ? process.argv[i + 1] : '';
	if (!password) throw new Error('Pass --password');
	await sendMail(cfg, {
		to: [{ email: to }],
		subject: 'Uw nieuwe website: login (2 van 2)',
		text: [
			'Beste,',
			'',
			`Na het extra slot logt u in op ${site}/admin met:`,
			'',
			`  E-mail:     ${to}`,
			`  Wachtwoord: ${password}`,
			'',
			'Daarna krijgt u telkens een code van 6 cijfers per e-mail. Vink "Dit toestel 30 dagen onthouden" aan op uw eigen computer of telefoon.',
			'Wijzig uw wachtwoord na de eerste keer onder Account.',
			'',
			'Met vriendelijke groeten,',
			'DRP BuildLab'
		].join('\n')
	});
} else {
	console.error('Usage: send-invite gate | login --password <pw>');
	process.exit(1);
}
console.log(`Sent (${step}) to ${to}.`);
