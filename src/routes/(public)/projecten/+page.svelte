<script lang="ts">
	import { page } from '$app/state';
	import ProjectsView from '$lib/views/ProjectsView.svelte';

	let { data } = $props();
	const ctx = $derived({ content: data.content, layout: data.layout, path: page.url.pathname, turnstileSiteKey: data.turnstileSiteKey });
</script>

<ProjectsView {ctx} />
