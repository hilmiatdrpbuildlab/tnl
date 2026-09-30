<script lang="ts">
	import type { Snippet } from 'svelte';
	import Footer from '$lib/components/Footer.svelte';
	import type { LayoutData } from '$lib/types';

	let { layout, children }: { layout: LayoutData; children: Snippet } = $props();
</script>

<a class="tnl-btn tnl-btn--sm l-skip" href="#main">Naar de inhoud</a>
{@render children()}
<Footer settings={layout.settings} services={layout.services} showBlog={layout.hasPosts} />
