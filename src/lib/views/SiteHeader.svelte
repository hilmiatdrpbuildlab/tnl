<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import type { ViewCtx } from './context';

	/** The header on a paper ground (pages without a photo hero). */
	let { ctx }: { ctx: ViewCtx } = $props();
</script>

<div class="tnl-container">
	<Header path={ctx.path} phone={ctx.layout.settings.company.phone} showBlog={ctx.layout.hasPosts} />
</div>
