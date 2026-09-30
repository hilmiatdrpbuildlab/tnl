<script lang="ts">
	import { enhance } from '$app/forms';
	import Field from '$lib/components/admin/Field.svelte';

	let { data, form } = $props();
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
</script>

<svelte:head><title>Account | TNL Group CMS</title></svelte:head>
<header class="adm-head">
	<div><h1>Account</h1><p>Ingelogd als {data.user.email}.</p></div>
	<form method="POST" action="?/logout"><button class="adm-btn" type="submit">Uitloggen</button></form>
</header>
<form method="POST" action="?/password" class="adm-card adm-form" use:enhance>
	<h2>Wachtwoord wijzigen</h2>
	<Field name="current" label="Huidig wachtwoord" type="password" autocomplete="current-password" required error={e.current} />
	<div class="adm-row">
		<Field name="next" label="Nieuw wachtwoord" type="password" autocomplete="new-password" required error={e.next} hint="Minstens 12 tekens." />
		<Field name="repeat" label="Herhaal het nieuwe wachtwoord" type="password" autocomplete="new-password" required error={e.repeat} />
	</div>
	<div class="adm-actions">
		<button class="adm-btn adm-btn--primary" type="submit">Wachtwoord wijzigen</button>
		{#if form?.saved}<span class="adm-pill adm-pill--on">Gewijzigd. Andere toestellen zijn uitgelogd.</span>{/if}
	</div>
</form>
<section class="adm-card adm-guide">
	<h2>Wachtwoord vergeten?</h2>
	<p>Vraag DRP BuildLab om het te herstellen. Zij zetten een nieuw wachtwoord met het script uit HANDOVER.md.</p>
</section>
