<script lang="ts">
	let { data } = $props();
	const fmt = (iso: string) =>
		new Intl.DateTimeFormat('nl-BE', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Brussels' }).format(new Date(iso));
</script>

<svelte:head><title>Overzicht | TNL Group CMS</title></svelte:head>

<header class="adm-head">
	<div>
		<h1>Overzicht</h1>
		<p>Welkom{data.user.name ? `, ${data.user.name}` : ''}. Hier ziet u wat er nog niet online staat en wat nog aandacht vraagt.</p>
	</div>
</header>

<div class="adm-grid">
	<div class="adm-card adm-stat"><strong>{data.unpublished}</strong><span>wijzigingen nog niet online</span></div>
	<div class="adm-card adm-stat">
		<strong>{data.unread}</strong><span><a href="/admin/berichten">ongelezen berichten</a></span>
	</div>
	<div class="adm-card adm-stat"><strong>{data.projects}</strong><span>projecten online</span></div>
	<div class="adm-card adm-stat">
		<span>Laatst gepubliceerd</span>
		<span style="color:var(--ink);font-size:17px">{data.live ? fmt(data.live) : 'Nog niet'}</span>
		{#if data.build?.status === 'failed'}<span class="adm-pill adm-pill--bad">Laatste poging mislukt</span>{/if}
	</div>
</div>

<section class="adm-card">
	<h2>Aandachtspunten</h2>
	{#if data.gaps.length}
		<ul class="adm-guide" style="padding-left:1.2em;margin:0">
			{#each data.gaps as g (g.text)}<li><a href={g.href}>{g.text}</a></li>{/each}
		</ul>
	{:else}
		<p class="adm-muted">Niets te melden. Alles ziet er goed uit.</p>
	{/if}
</section>

<section class="adm-card adm-guide">
	<h2>Zo werkt het</h2>
	<p><strong>Opslaan is nog niet publiceren.</strong> Wat u opslaat, staat veilig in het CMS maar nog niet op de website. Pas als u bovenaan op <strong>Publiceren</strong> klikt, wordt de website opnieuw opgebouwd. Dat duurt een paar minuten; daarna staat er <strong>Live</strong>.</p>
	<p><strong>Een project met voor- en na-foto toevoegen:</strong></p>
	<ol>
		<li>Ga naar <a href="/admin/projecten">Projecten</a> en klik op <strong>Nieuw project</strong>.</li>
		<li>Vul de titel in, kies de dienst en schrijf één zin over het werk.</li>
		<li>Kies een voor-foto en een na-foto, genomen vanop dezelfde plek. Het moeten er altijd twee zijn.</li>
		<li>Vink <strong>Zichtbaar op de website</strong> aan, sla op en klik op <strong>Publiceren</strong>.</li>
	</ol>
	<p><strong>Berichten</strong> via het contactformulier komen per e-mail binnen op het adres uit <a href="/admin/instellingen">Instellingen</a>, en staan ook onder <a href="/admin/berichten">Berichten</a>. Ze worden na 12 maanden automatisch verwijderd.</p>
	<p>Met <strong>Voorbeeld</strong> in elk scherm ziet u een pagina zoals ze eruit zal zien, nog voor u publiceert.</p>
</section>
