<script lang="ts">
	import Image from './Image.svelte';
	import type { Img, SiteSettings } from '$lib/types';
	import { addressLine, telHref } from '$lib/format';
	import { contactForm } from '$lib/actions/contactForm';
	import FormField from './FormField.svelte';
	import Icon from './icons/Icon.svelte';
	import SectionHeader from './SectionHeader.svelte';

	interface Props {
		settings: SiteSettings;
		photo: Img | null;
		turnstileSiteKey?: string;
		/** Render the section head (eyebrow, title, lead) above the block. */
		withHeading?: boolean;
		headingLevel?: 1 | 2;
		privacyNotice?: string;
		/** CMS preview: render the form but never send it. */
		preview?: boolean;
	}
	let {
		settings,
		photo,
		turnstileSiteKey = '',
		withHeading = true,
		headingLevel = 2,
		privacyNotice = '',
		preview = false
	}: Props = $props();
	const c = $derived(settings.company);

</script>

<svelte:head>
	{#if turnstileSiteKey && !preview}
		<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
	{/if}
</svelte:head>

{#if withHeading}
	<SectionHeader
		eyebrow="Contact"
		title="Contacteer ons"
		lead="Vul uw gegevens in en wij nemen zo snel mogelijk contact met u op."
		level={headingLevel}
	/>
{/if}
<div class="tnl-contact" id="contact">
	<div class="tnl-contact__visual" data-theme="forest">
		{#if photo}<Image img={photo} sizes='(max-width: 900px) 100vw, 40vw' loading="lazy" />{/if}
		<div class="tnl-glass tnl-contact__info">
			<div class="tnl-contact__row">
				<Icon name="map-pin" />
				<div><strong>Adres</strong><span>{addressLine(c)}</span></div>
			</div>
			<div class="tnl-contact__row">
				<Icon name="mail" />
				<div><strong>E-mail</strong><a href="mailto:{c.email}">{c.email}</a></div>
			</div>
			<div class="tnl-contact__row">
				<Icon name="phone" />
				<div><strong>Telefoon</strong><a href={telHref(c.phone)}>{c.phone}</a></div>
			</div>
		</div>
	</div>
	<div class="tnl-contact__card">
		<form
			class="tnl-form"
			method="POST"
			action="/api/submit"
			novalidate
			data-tnl-form
			data-preview={preview ? '' : undefined}
			use:contactForm
		>
			<FormField id="cf-voornaam" name="voornaam" label="Voornaam" autocomplete="given-name" required maxlength={100} error="Vul uw voornaam in." />
			<FormField id="cf-achternaam" name="achternaam" label="Achternaam" autocomplete="family-name" maxlength={100} />
			<FormField
				id="cf-email"
				name="email"
				type="email"
				label="Email"
				autocomplete="email"
				placeholder="naam@voorbeeld.be"
				required
				full
				maxlength={200}
				error="Vul een geldig e-mailadres in, bijvoorbeeld naam@voorbeeld.be."
			/>
			<FormField id="cf-onderwerp" name="onderwerp" label="Onderwerp" placeholder="Bijvoorbeeld: onderhoud haag en gazon" full maxlength={200} />
			<FormField id="cf-bericht" name="bericht" type="textarea" label="Uw bericht" required full maxlength={5000} error="Schrijf kort waarmee we u kunnen helpen." />
			<!-- Honeypot: hidden from people, filled in by bots. -->
			<div class="l-hp" aria-hidden="true">
				<label for="cf-website">Website</label>
				<input id="cf-website" name="website" type="text" tabindex="-1" autocomplete="off" />
			</div>
			{#if turnstileSiteKey && !preview}
				<div class="cf-turnstile" data-sitekey={turnstileSiteKey} data-language="nl" data-size="flexible"></div>
			{/if}
			{#if privacyNotice}<p class="tnl-form__note">{privacyNotice}</p>{/if}
			<p class="tnl-form__note" role="alert" data-tnl-failure hidden>
				Uw bericht kon niet worden verzonden. Probeer het opnieuw, of mail naar <a href="mailto:{c.email}">{c.email}</a>.
			</p>
			<button class="tnl-btn" type="submit">Verzenden</button>
		</form>
		<div class="tnl-form-success" data-tnl-success tabindex="-1" role="status" hidden>
			<span class="tnl-avatar"><Icon name="check" /></span>
			<h3 class="t-h3">Hartelijk bedankt!</h3>
			<p class="t-lead">Wij nemen zo snel mogelijk contact met u op.</p>
		</div>
	</div>
</div>
