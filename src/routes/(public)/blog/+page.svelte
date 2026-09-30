<script lang="ts">
	import { page } from '$app/state';
	import BlogView from '$lib/views/BlogView.svelte';

	let { data } = $props();
	const ctx = $derived({ content: data.content, layout: data.layout, path: page.url.pathname, turnstileSiteKey: data.turnstileSiteKey });
</script>

<BlogView {ctx} />
