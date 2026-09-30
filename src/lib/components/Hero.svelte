<script lang="ts">
	import Image from './Image.svelte';
	import type { Snippet } from 'svelte';
	import type { Img } from '$lib/types';
	
	import Eyebrow from './Eyebrow.svelte';

	interface Props {
		/** `home`: full height with a t-display statement. `interior`: about 480px with a t-h1. */
		variant?: 'home' | 'interior';
		image: Img | null;
		eyebrow?: string;
		title: string;
		/** The Header, rendered inside the Forest frame. */
		header: Snippet;
		/** Text in the glass panel. Leave empty to drop the panel. */
		panelText?: string;
		/** One primary button and one text link, never more. */
		actions?: Snippet;
	}
	let { variant = 'home', image, eyebrow, title, header, panelText, actions }: Props = $props();
</script>

<section class="tnl-hero" class:tnl-hero--interior={variant === 'interior'} data-theme="light">
	<div class="tnl-hero__frame" data-theme="forest">
		{#if image}
			<Image class="tnl-hero__media" img={image} sizes='100vw' fetchpriority="high" loading="eager" />
		{/if}
		<div class="tnl-container">
			{@render header()}
		</div>
		<div class="tnl-container tnl-hero__body">
			<div class="tnl-hero__copy">
				{#if eyebrow}<Eyebrow text={eyebrow} />{/if}
				<h1 class={variant === 'home' ? 't-display' : 't-h1'}>{title}</h1>
			</div>
			{#if panelText}
				<aside class="tnl-glass tnl-hero__panel">
					<p class="t-lead">{panelText}</p>
					{#if actions}<div class="tnl-hero__actions">{@render actions()}</div>{/if}
				</aside>
			{/if}
		</div>
	</div>
</section>
