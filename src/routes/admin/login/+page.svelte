<script lang="ts">
	import { goto } from '$app/navigation';
	import Logo from '$lib/components/Logo.svelte';

	/**
	 * Step 1: e-mail + password. Step 2: the 6-digit code from the e-mail (5 minutes valid,
	 * "Code opnieuw sturen" after 60 seconds). A trusted device skips step 2 for 30 days.
	 */
	let { data } = $props();
	const API = '/admin/api/auth';
	let step = $state<'password' | 'code'>('password');
	let email = $state('');
	let password = $state('');
	let code = $state('');
	let trust = $state(true);
	let busy = $state(false);
	let error = $state('');
	let info = $state('');
	let resendIn = $state(0);
	let tick: ReturnType<typeof setInterval> | undefined;

	async function post(path: string, body: unknown) {
		const res = await fetch(API + path, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body)
		});
		const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
		return { ok: res.ok, status: res.status, json };
	}

	function startResendTimer() {
		resendIn = data.resendAfter;
		clearInterval(tick);
		tick = setInterval(() => {
			resendIn = Math.max(0, resendIn - 1);
			if (!resendIn) clearInterval(tick);
		}, 1000);
	}

	async function sendCode() {
		const r = await post('/two-factor/send-otp', { trustDevice: trust });
		if (!r.ok) throw new Error('De code kon niet worden verstuurd. Probeer opnieuw in te loggen.');
		info = `We stuurden een code naar ${email}.`;
		startResendTimer();
	}

	async function signIn(e: SubmitEvent) {
		e.preventDefault();
		busy = true;
		error = '';
		try {
			const r = await post('/sign-in/email', { email, password, rememberMe: true });
			if (!r.ok) {
				error = r.status === 429 ? 'Te veel pogingen. Wacht even en probeer opnieuw.' : 'E-mailadres of wachtwoord klopt niet.';
				return;
			}
			if (r.json.twoFactorRedirect) {
				step = 'code';
				await sendCode();
			} else {
				await goto('/admin', { invalidateAll: true });
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Inloggen is mislukt.';
		} finally {
			busy = false;
		}
	}

	async function verify(e: SubmitEvent) {
		e.preventDefault();
		busy = true;
		error = '';
		try {
			const r = await post('/two-factor/verify-otp', { code: code.replace(/\D/g, ''), trustDevice: trust });
			if (r.status === 429 && !/LOCK/i.test(String((r.json as { code?: string }).code ?? ''))) {
				error = 'Te veel pogingen. Wacht een minuut en probeer opnieuw.';
				return;
			}
			if (!r.ok) {
				const msg = String((r.json as { code?: string; message?: string }).code ?? '');
				error = /LOCK/i.test(msg)
					? 'Te veel foute codes. Het account is 15 minuten geblokkeerd.'
					: /EXPIRED/i.test(msg)
						? 'Deze code is verlopen. Vraag een nieuwe code aan.'
						: /TOO_MANY/i.test(msg)
							? 'Te veel pogingen met deze code. Vraag een nieuwe code aan.'
							: 'Deze code klopt niet.';
				return;
			}
			await goto('/admin', { invalidateAll: true });
		} finally {
			busy = false;
		}
	}

	async function resend() {
		error = '';
		try {
			await sendCode();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Versturen is mislukt.';
		}
	}
</script>

<svelte:head><title>Inloggen | TNL Group CMS</title></svelte:head>

<main class="adm-login">
	<div class="adm-login__card">
		<Logo width={120} />
		{#if step === 'password'}
			<h1>Inloggen</h1>
			<form class="adm-form" onsubmit={signIn}>
				<div class="adm-field">
					<label for="email">E-mailadres</label>
					<input id="email" type="email" autocomplete="username" required bind:value={email} />
				</div>
				<div class="adm-field">
					<label for="password">Wachtwoord</label>
					<input id="password" type="password" autocomplete="current-password" required bind:value={password} />
				</div>
				{#if error}<p class="adm-notice adm-notice--bad" role="alert">{error}</p>{/if}
				<button class="adm-btn adm-btn--primary" type="submit" disabled={busy}>{busy ? 'Bezig…' : 'Verder'}</button>
			</form>
		{:else}
			<h1>Code invoeren</h1>
			<form class="adm-form" onsubmit={verify}>
				{#if info}<p class="adm-hint" aria-live="polite">{info} De code is 5 minuten geldig.</p>{/if}
				<div class="adm-field">
					<label for="code">Code uit de e-mail</label>
					<!-- svelte-ignore a11y_autofocus -->
					<input id="code" class="adm-code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern={"[0-9]{6}"} required bind:value={code} autofocus />
				</div>
				<label class="adm-check"><input type="checkbox" bind:checked={trust} /> <span>Dit toestel 30 dagen onthouden</span></label>
				{#if error}<p class="adm-notice adm-notice--bad" role="alert">{error}</p>{/if}
				<button class="adm-btn adm-btn--primary" type="submit" disabled={busy}>{busy ? 'Bezig…' : 'Inloggen'}</button>
				{#if resendIn > 0}
					<p class="adm-hint">Geen code ontvangen? Over {resendIn} seconden kunt u een nieuwe vragen.</p>
				{:else}
					<button type="button" class="adm-btn" onclick={resend}>Code opnieuw sturen</button>
				{/if}
			</form>
		{/if}
	</div>
</main>
