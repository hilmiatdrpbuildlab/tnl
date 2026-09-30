<script lang="ts">
	import type { Snippet } from 'svelte';
	import Eyebrow from './Eyebrow.svelte';

	interface Props {
		eyebrow: string;
		title: string;
		lead?: string;
		/** Visual size: t-h1 for main sections, t-h2 for sub-sections. */
		size?: 'h1' | 'h2';
		/** The HTML heading level. The page's own h1 is usually in the Hero. */
		level?: 1 | 2 | 3;
		action?: Snippet;
	}
	let { eyebrow, title, lead, size = 'h1', level = 2, action }: Props = $props();
	const tag = $derived(`h${level}`);
</script>

<div class="tnl-section-head">
	<div class="tnl-section-head__text">
		<Eyebrow text={eyebrow} />
		<svelte:element this={tag} class="t-{size}">{title}</svelte:element>
		{#if lead}<p class="t-lead">{lead}</p>{/if}
	</div>
	{#if action}{@render action()}{/if}
</div>
