<script lang="ts">
	import type { Img } from '$lib/types';

	/**
	 * An <img> from an Img. Attributes are written out, never spread: Svelte adds inline
	 * onload/onerror handlers to spread images, which the CSP (hash mode) refuses.
	 */
	interface Props {
		img: Img;
		class?: string;
		sizes?: string;
		alt?: string;
		loading?: 'lazy' | 'eager';
		fetchpriority?: 'high' | 'low' | 'auto';
	}
	let { img, class: className, sizes = '100vw', alt, loading = 'lazy', fetchpriority }: Props = $props();
</script>

<img
	class={className}
	src={img.src}
	srcset={img.srcset || undefined}
	sizes={img.srcset ? sizes : undefined}
	width={img.width}
	height={img.height}
	alt={alt ?? img.alt}
	{loading}
	{fetchpriority}
	decoding="async"
/>
