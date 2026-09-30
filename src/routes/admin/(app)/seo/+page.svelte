<script lang="ts">
	import { enhance } from '$app/forms';
	import ConfirmDialog from '$lib/components/admin/ConfirmDialog.svelte';
	import { META_DESCRIPTION_MAX, SEO_TITLE_MAX } from '$lib/seo';

	let { data, form } = $props();
	const errs = (id: string) => (form && 'id' in form && form.id === id ? ((form.errors ?? {}) as Record<string, string>) : {});
</script>

<svelte:head><title>SEO & redirects | TNL Group CMS</title></svelte:head>
<header class="adm-head">
	<div><h1>SEO & redirects</h1><p>Titels en beschrijvingen per pagina (max. {SEO_TITLE_MAX} en {META_DESCRIPTION_MAX} tekens), en doorverwijzingen van oude adressen.</p></div>
</header>

<section class="adm-card">
	<h2>Titels en beschrijvingen</h2>
	<table class="adm-table">
		<thead><tr><th>Pagina</th><th>SEO-titel</th><th>Beschrijving</th></tr></thead>
		<tbody>
			{#each data.items as it (it.href)}
				<tr>
					<td><a href={it.href}>{it.name}</a><br /><span class="adm-muted">{it.kind} · {it.path}</span>{#if !it.visible}<br /><span class="adm-pill">Verborgen</span>{/if}</td>
					<td>
						{#if it.seoTitle}{it.seoTitle} <span class="adm-muted">({it.seoTitle.length})</span>{:else}<span class="adm-pill">Automatisch</span>{/if}
						{#if it.issues.includes('seo_title')}<span class="adm-pill adm-pill--bad">Te lang</span>{/if}
					</td>
					<td>
						{#if it.metaDescription}<span class="adm-muted">{it.metaDescription.length} tekens</span>{:else}<span class="adm-pill adm-pill--warn">Ontbreekt</span>{/if}
						{#if it.issues.includes('meta_description')}<span class="adm-pill adm-pill--bad">Te lang</span>{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>

<section class="adm-card">
	<h2>Doorverwijzingen</h2>
	<p class="adm-hint">Een gewijzigd adres van een dienst, project of artikel krijgt automatisch een doorverwijzing. Oude Wix-adressen staan hier ook, klaar voor de verhuis van het domein.</p>
	{#each data.redirects as r (r.id)}
		<div class="adm-rows__row" style="grid-template-columns:1fr 1fr 110px auto auto;align-items:start">
			<form method="POST" action="?/saveRedirect" use:enhance={() => async ({ update }) => update({ reset: false })} style="display:contents">
				<input type="hidden" name="id" value={r.id} />
				<div class="adm-field"><label class="adm-sr" for="from-{r.id}">Van</label><input id="from-{r.id}" name="fromPath" value={r.fromPath} />{#if errs(r.id).fromPath}<p class="adm-error">{errs(r.id).fromPath}</p>{/if}</div>
				<div class="adm-field"><label class="adm-sr" for="to-{r.id}">Naar</label><input id="to-{r.id}" name="toPath" value={r.toPath} />{#if errs(r.id).toPath}<p class="adm-error">{errs(r.id).toPath}</p>{/if}</div>
				<div class="adm-field"><label class="adm-sr" for="st-{r.id}">Soort</label><select id="st-{r.id}" name="status" value={String(r.status)}><option value="301">301 blijvend</option><option value="302">302 tijdelijk</option></select></div>
				<input type="hidden" name="note" value={r.note ?? ''} />
				<button class="adm-btn adm-btn--sm" type="submit">Opslaan</button>
			</form>
			<ConfirmDialog itemName={`de doorverwijzing ${r.fromPath}`} fields={{ id: r.id }} small />
		</div>
	{/each}
	<form method="POST" action="?/saveRedirect" use:enhance class="adm-rows__row" style="grid-template-columns:1fr 1fr 110px auto;align-items:start;margin-top:12px">
		<input type="hidden" name="id" value="" />
		<div class="adm-field"><label for="from-new" class="adm-label">Van (oud adres)</label><input id="from-new" name="fromPath" placeholder="/oude-pagina" />{#if errs('').fromPath}<p class="adm-error">{errs('').fromPath}</p>{/if}</div>
		<div class="adm-field"><label for="to-new" class="adm-label">Naar</label><input id="to-new" name="toPath" placeholder="/diensten" />{#if errs('').toPath}<p class="adm-error">{errs('').toPath}</p>{/if}</div>
		<div class="adm-field"><label for="st-new" class="adm-label">Soort</label><select id="st-new" name="status"><option value="301">301 blijvend</option><option value="302">302 tijdelijk</option></select></div>
		<button class="adm-btn adm-btn--primary" type="submit" style="margin-top:22px">Toevoegen</button>
	</form>
	{#if errs('')._}<p class="adm-error">{errs('')._}</p>{/if}
</section>
