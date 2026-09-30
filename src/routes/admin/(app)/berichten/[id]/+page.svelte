<script lang="ts">
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';

	let { data } = $props();
	const m = $derived(data.message);
	const fmt = (iso: string) =>
		new Intl.DateTimeFormat('nl-BE', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Brussels' }).format(new Date(iso));
</script>

<svelte:head><title>Bericht van {m.firstName} | TNL Group CMS</title></svelte:head>
<header class="adm-head">
	<div><p><a href="/admin/berichten">Berichten</a></p><h1>{m.firstName} {m.lastName ?? ''}</h1><p>{fmt(m.createdAt)}</p></div>
	<div class="adm-actions">
		<a class="adm-btn adm-btn--primary" href="mailto:{m.email}?subject={encodeURIComponent('Re: ' + (m.subject ?? 'uw bericht aan TNL Group'))}">Antwoorden</a>
		<ConfirmDialog itemName={`het bericht van ${m.firstName}`} />
	</div>
</header>
<section class="adm-card">
	<dl style="display:grid;grid-template-columns:max-content 1fr;gap:6px 16px;margin:0">
		<dt class="adm-muted">E-mail</dt><dd style="margin:0"><a href="mailto:{m.email}">{m.email}</a></dd>
		{#if m.subject}<dt class="adm-muted">Onderwerp</dt><dd style="margin:0">{m.subject}</dd>{/if}
		<dt class="adm-muted">E-mailmelding</dt><dd style="margin:0">{m.notifiedAt ? 'verstuurd' : 'niet verstuurd'}</dd>
	</dl>
	<div class="adm-msg">{m.message}</div>
</section>
