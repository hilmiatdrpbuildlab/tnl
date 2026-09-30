<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Field from '$lib/components/admin/Field.svelte';
	import ImageField from '$lib/components/admin/ImageField.svelte';
	import MarkdownField from '$lib/components/admin/MarkdownField.svelte';
	import RepeatRows from '$lib/components/admin/RepeatRows.svelte';
	import SeoPanel from '$lib/components/admin/SeoPanel.svelte';
	import Check from '$lib/components/admin/Check.svelte';
	import SaveBar from '$lib/components/admin/SaveBar.svelte';

	let { data, form } = $props();
	const p = $derived(data.page);
	const b = $derived(p.blocks as Record<string, string & unknown>);
	const e = $derived((form?.errors ?? {}) as Record<string, string>);
	const path = $derived(p.slug === 'home' ? '/' : `/${p.slug}`);
	const pillars = $derived(((b.pillars as unknown as { title: string; text: string }[]) ?? []).map((x) => ({ name: x.title, detail: x.text })));
	let saving = $state(false);
</script>

<svelte:head><title>{p.title} | TNL Group CMS</title></svelte:head>

<header class="adm-head">
	<div>
		<p><a href="/admin/paginas">Pagina's</a></p>
		<h1>{p.slug === 'home' ? 'Home' : p.title}</h1>
	</div>
	<div class="adm-actions"><a class="adm-btn" href="/admin/preview{path}" target="_blank" rel="noopener">Voorbeeld</a></div>
</header>

{#key page.url.pathname}
<form method="POST" class="adm-form" use:enhance={() => { saving = true; return async ({ update }) => { await update({ reset: false }); saving = false; }; }}>
	{#if p.slug === 'home'}
		<section class="adm-card">
			<h2>Bovenaan de homepage</h2>
			<Field name="b_statement" label="Slogan (max. drie woorden)" value={b.statement} max={40} error={e.b_statement} required />
			<Field name="b_eyebrow" label="Regel boven de slogan" value={b.eyebrow} error={e.b_eyebrow} />
			<Field name="b_panelText" label="Tekst in het vak rechts" type="textarea" rows={3} value={b.panelText} max={400} error={e.b_panelText} />
			<div class="adm-row">
				<Field name="b_primaryLabel" label="Knop" value={b.primaryLabel} />
				<Field name="b_secondaryLabel" label="Link" value={b.secondaryLabel} />
			</div>
		</section>
		<section class="adm-card">
			<h2>Titels van de blokken</h2>
			<div class="adm-row">
				<Field name="b_servicesTitle" label="Diensten: titel" value={b.servicesTitle} />
				<Field name="b_projectsTitle" label="Projecten: titel" value={b.projectsTitle} />
			</div>
			<Field name="b_servicesLead" label="Diensten: inleiding" type="textarea" rows={2} value={b.servicesLead} />
			<Field name="b_projectsLead" label="Projecten: inleiding" type="textarea" rows={2} value={b.projectsLead} />
			<div class="adm-row">
				<Field name="b_faqTitle" label="FAQ: titel" value={b.faqTitle} />
				<Field name="b_faqLead" label="FAQ: inleiding" value={b.faqLead} />
			</div>
		</section>
	{/if}

	<section class="adm-card">
		<h2>Inhoud</h2>
		<Field name="title" label="Titel" value={p.title} required error={e.title} />
		<Field name="intro" label="Inleiding" type="textarea" rows={3} value={p.intro} error={e.intro} />
		<ImageField name="heroMediaId" label="Foto bovenaan" media={p.heroMediaId ? (data.media[p.heroMediaId] ?? null) : null} hint={p.slug === 'contact' ? 'Ook gebruikt naast het contactformulier op elke pagina.' : undefined} />
		{#if p.slug === 'over-ons'}
			<Field name="b_statement" label="Uitspraak" value={b.statement} error={e.b_statement} />
			<RepeatRows name="b_pillars" label="Zo werken wij (drie punten, vier hooguit)" rows={pillars} max={4} namePlaceholder="Titel" detailPlaceholder="Eén zin" error={e.b_pillars} />
		{/if}
		{#if p.slug === 'contact'}
			<Field name="b_privacyNotice" label="Privacytekst onder het formulier" type="textarea" rows={3} value={b.privacyNotice} max={600} error={e.b_privacyNotice} />
		{/if}
		{#if p.slug === 'over-ons'}
			<MarkdownField name="body" label="Extra tekst (optioneel)" value={p.body} />
		{:else}
			<input type="hidden" name="body" value={p.body} />
		{/if}
	</section>

	<SeoPanel seoTitle={p.seoTitle} metaDescription={p.metaDescription} errors={e} fallbackTitle={p.title} />
	<section class="adm-card">
		<Check name="noindex" label="Verbergen voor zoekmachines (noindex)" checked={p.noindex} />
	</section>

	<SaveBar {saving} saved={!!form?.saved} error={e._} />
</form>
{/key}
