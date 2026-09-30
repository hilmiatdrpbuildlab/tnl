<script lang="ts">
	import { page } from '$app/state';
	import ProjectView from '$lib/views/ProjectView.svelte';

	let { data } = $props();
	const ctx = $derived({ content: data.content, layout: data.layout, path: page.url.pathname, turnstileSiteKey: data.turnstileSiteKey });
</script>

<ProjectView {ctx} slug={data.slug} />
