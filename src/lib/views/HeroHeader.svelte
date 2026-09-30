<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import type { ViewCtx } from './context';

	/** The header inside a Forest photo frame. */
	let { ctx }: { ctx: ViewCtx } = $props();
</script>

<Header path={ctx.path} phone={ctx.layout.settings.company.phone} showBlog={ctx.layout.hasPosts} onDark />
