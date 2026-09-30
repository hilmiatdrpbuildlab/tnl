<script lang="ts">
	import { page } from '$app/state';
	import PostView from '$lib/views/PostView.svelte';

	let { data } = $props();
	const ctx = $derived({ content: data.content, layout: data.layout, path: page.url.pathname, turnstileSiteKey: data.turnstileSiteKey });
</script>

<PostView {ctx} slug={data.slug} />
