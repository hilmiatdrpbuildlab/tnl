<script lang="ts">
	import { page } from '$app/state';
	import HomeView from '$lib/views/HomeView.svelte';

	let { data } = $props();
	const ctx = $derived({ content: data.content, layout: data.layout, path: page.url.pathname, turnstileSiteKey: data.turnstileSiteKey });
</script>

<HomeView {ctx} />
