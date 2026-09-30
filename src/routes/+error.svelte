<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head><title>Er ging iets mis | TNL Group</title><meta name="robots" content="noindex" /></svelte:head>

<main class="tnl-section">
	<div class="tnl-container tnl-section-head__text">
		<span class="tnl-eyebrow">Fout {page.status}</span>
		<h1 class="t-h1">{page.status === 404 ? 'Deze pagina bestaat niet' : 'Er ging iets mis'}</h1>
		<p class="t-lead">{page.status === 404 ? 'Controleer het adres of ga terug naar de homepage.' : 'Probeer het later opnieuw.'}</p>
		<p><a class="tnl-btn" href="/">Naar de homepage</a></p>
	</div>
</main>
