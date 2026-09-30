<script lang="ts">
	import Image from './Image.svelte';
	import type { Img } from '$lib/types';
	import { beforeAfter } from '$lib/actions/beforeAfter';
	
	import Icon from './icons/Icon.svelte';

	/** Both photos need the same aspect ratio, shot from the same spot. Alt text starts with Voor:/Na:. */
	let { before, after }: { before: Img; after: Img } = $props();
	const withPrefix = (img: Img, prefix: string) =>
		img.alt.startsWith(prefix) ? img.alt : `${prefix} ${img.alt}`.trim();
</script>

<figure class="tnl-ba" data-tnl-ba use:beforeAfter>
	<Image class="tnl-ba__img" img={after} sizes='100vw' alt={withPrefix(after, 'Na:')} loading="lazy" fetchpriority="low" />
	<Image class="tnl-ba__img tnl-ba__img--before" img={before} sizes='100vw' alt={withPrefix(before, 'Voor:')} loading="lazy" fetchpriority="low" />
	<span class="tnl-badge tnl-ba__label tnl-ba__label--before">Voor</span>
	<span class="tnl-badge tnl-badge--accent tnl-ba__label tnl-ba__label--after">Na</span>
	<input class="tnl-ba__range" type="range" min="0" max="100" value="50" aria-label="Vergelijk voor en na" />
	<div class="tnl-ba__handle" aria-hidden="true"><span><Icon name="chevrons-left-right" /></span></div>
</figure>
