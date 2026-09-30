<script lang="ts">
	import AboutView from '$lib/views/AboutView.svelte';
	import BlogView from '$lib/views/BlogView.svelte';
	import ContactView from '$lib/views/ContactView.svelte';
	import HomeView from '$lib/views/HomeView.svelte';
	import PostView from '$lib/views/PostView.svelte';
	import ProjectView from '$lib/views/ProjectView.svelte';
	import ProjectsView from '$lib/views/ProjectsView.svelte';
	import ServicesView from '$lib/views/ServicesView.svelte';
	import ServiceView from '$lib/views/ServiceView.svelte';
	import Shell from '$lib/views/Shell.svelte';

	let { data } = $props();
	const ctx = $derived({ content: data.content, layout: data.layout, path: data.path, preview: true });
</script>

<div class="adm-banner" data-state="changes" role="note" style="position:sticky;top:0;z-index:50">
	<p class="adm-banner__text"><span class="adm-banner__dot" aria-hidden="true"></span> Voorbeeld met de opgeslagen versie, ook wat nog niet online staat.</p>
	<a class="adm-btn" href="/admin">Terug naar het CMS</a>
</div>
<Shell layout={data.layout}>
	{#if data.view === 'home'}<HomeView {ctx} />
	{:else if data.view === 'services'}<ServicesView {ctx} />
	{:else if data.view === 'service'}<ServiceView {ctx} slug={data.slug} />
	{:else if data.view === 'projects'}<ProjectsView {ctx} />
	{:else if data.view === 'project'}<ProjectView {ctx} slug={data.slug} />
	{:else if data.view === 'about'}<AboutView {ctx} />
	{:else if data.view === 'contact'}<ContactView {ctx} />
	{:else if data.view === 'blog'}<BlogView {ctx} />
	{:else if data.view === 'post'}<PostView {ctx} slug={data.slug} />{/if}
</Shell>
