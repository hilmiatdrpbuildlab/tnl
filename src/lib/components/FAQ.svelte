<script lang="ts">
	import type { Faq } from '$lib/types';
	import Eyebrow from './Eyebrow.svelte';
	import Icon from './icons/Icon.svelte';

	interface Props {
		items: Faq[];
		title?: string;
		lead?: string;
		ctaHref?: string;
	}
	let {
		items,
		title = 'Vragen?',
		lead = 'Staat uw vraag er niet tussen? Neem zeker vrijblijvend contact op.',
		ctaHref = '/contact'
	}: Props = $props();
</script>

{#if items.length}
	<div class="tnl-faq">
		<div class="tnl-faq__intro">
			<Eyebrow text="FAQ" />
			<h2 class="t-h2">{title}</h2>
			<p class="t-lead">{lead}</p>
			<a class="tnl-btn" href={ctaHref}
				>Contacteer ons <span class="tnl-btn__dot"><Icon name="arrow-up-right" /></span></a
			>
		</div>
		<div class="tnl-faq__list">
			{#each items as item, i (item.id)}
				<details class="tnl-faq__item" open={i === 0}>
					<summary
						>{item.question}<span class="tnl-faq__toggle" aria-hidden="true"><Icon name="chevron-down" /></span
						></summary
					>
					<div class="tnl-faq__answer"><p>{item.answer}</p></div>
				</details>
			{/each}
		</div>
	</div>
{/if}
