<script lang="ts">
	import Image from './Image.svelte';
	import type { Review } from '$lib/types';
	import { initials } from '$lib/format';
	import Icon from './icons/Icon.svelte';

	/** Only real reviews with the customer's permission (the CMS enforces consent). */
	let { review, solo = false }: { review: Review; solo?: boolean } = $props();
	const meta = $derived([review.place, review.serviceTitle].filter(Boolean).join(' · '));
	const showPhoto = $derived(!solo && !!review.photo);
</script>

<figure class="tnl-quote" class:tnl-quote--solo={!showPhoto}>
	<div class="tnl-quote__body">
		{#if review.rating}
			<div class="tnl-stars" role="img" aria-label="{review.rating} op 5 sterren">
				{#each Array.from({ length: review.rating }, (_, i) => i) as i (i)}<Icon name="star" />{/each}
			</div>
		{/if}
		<blockquote>{review.quote}</blockquote>
		<!-- Markup as in design-system-v2 Testimonial/preview.html -->
		<!-- svelte-ignore a11y_figcaption_parent -->
		<figcaption>
			<span class="tnl-avatar" aria-hidden="true">{initials(review.authorName)}</span>
			<span
				><span class="tnl-quote__name">{review.authorName}</span>{#if meta}<br /><span class="tnl-quote__meta"
						>{meta}</span
					>{/if}</span
			>
		</figcaption>
	</div>
	{#if showPhoto && review.photo}
		<Image class="tnl-quote__media" img={review.photo} sizes='(max-width: 820px) 100vw, 45vw' loading="lazy" />
	{/if}
</figure>
