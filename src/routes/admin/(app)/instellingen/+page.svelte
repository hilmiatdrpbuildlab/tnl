<script lang="ts">
	import { enhance } from '$app/forms';
	import Field from '$lib/components/admin/Field.svelte';
	import SaveBar from '$lib/components/admin/SaveBar.svelte';

	let { data, form } = $props();
	const c = $derived(data.settings?.company);
	const so = $derived(data.settings?.socials ?? {});
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
	let saving = $state(false);
</script>

<svelte:head><title>Instellingen | TNL Group CMS</title></svelte:head>
<header class="adm-head">
	<div><h1>Instellingen</h1><p>Deze gegevens staan op elke pagina: in de header, de footer, het contactblok en voor Google. Na Publiceren zijn ze overal aangepast.</p></div>
</header>
<form method="POST" class="adm-form" use:enhance={() => { saving = true; return async ({ update }) => { await update({ reset: false }); saving = false; }; }}>
	<section class="adm-card">
		<h2>Bedrijf</h2>
		<Field name="name" label="Bedrijfsnaam" value={c?.name} required error={e['company.name']} />
		<div class="adm-row">
			<Field name="street" label="Straat en nummer" value={c?.street} required error={e['company.street']} />
			<div class="adm-row">
				<Field name="postcode" label="Postcode" value={c?.postcode} required error={e['company.postcode']} />
				<Field name="city" label="Gemeente" value={c?.city} required error={e['company.city']} />
			</div>
		</div>
		<div class="adm-row">
			<Field name="email" label="E-mail" type="email" value={c?.email} required error={e['company.email']} />
			<Field name="phone" label="Telefoon" value={c?.phone} required error={e['company.phone']} hint="Schrijf het zoals het op de website moet staan: +32 (0) 495 75 54 37" />
		</div>
		<Field name="companyNumber" label="Ondernemingsnummer" value={c?.companyNumber} error={e['company.companyNumber']} hint="Wettelijk verplicht op een Belgische bedrijfswebsite. Bijvoorbeeld BE 0123.456.789." />
	</section>
	<section class="adm-card">
		<h2>Sociale media</h2>
		<div class="adm-row">
			<Field name="facebook" label="Facebook" type="url" value={so.facebook} error={e['socials.facebook']} />
			<Field name="instagram" label="Instagram" type="url" value={so.instagram} error={e['socials.instagram']} />
		</div>
	</section>
	<section class="adm-card">
		<h2>Contactformulier</h2>
		<Field name="notifyEmail" label="Nieuwe berichten gaan naar" type="email" value={data.settings?.notifyEmail} required error={e.notifyEmail} hint="Het formulier gebruikt het adres uit de laatst gepubliceerde versie: publiceer na een wijziging." />
	</section>
	<SaveBar {saving} saved={!!form?.saved} />
</form>
