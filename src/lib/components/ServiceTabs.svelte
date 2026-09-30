<script lang="ts">
	import Image from './Image.svelte';
	import type { Service } from '$lib/types';
	import { tabs } from '$lib/actions/tabs';
	
	import Chips from './Chips.svelte';
	import Icon from './icons/Icon.svelte';

	/** One service at a time, for the Diensten page. */
	let { services }: { services: Service[] } = $props();
</script>

<div use:tabs data-tnl-tabs>
	<div class="tnl-tabs__list" role="tablist" aria-label="Diensten">
		{#each services as s, i (s.id)}
			<button
				class="tnl-tabs__tab"
				type="button"
				role="tab"
				id="tab-{s.slug}"
				aria-controls="panel-{s.slug}"
				aria-selected={i === 0 ? 'true' : 'false'}
				tabindex={i === 0 ? 0 : -1}>{s.title}</button
			>
		{/each}
	</div>
	{#each services as s, i (s.id)}
		<div class="tnl-tabs__panel" role="tabpanel" id="panel-{s.slug}" aria-labelledby="tab-{s.slug}" hidden={i !== 0}>
			{#if s.hero}<Image class="tnl-tabs__media" img={s.hero} sizes='100vw' loading="lazy" />{/if}
			<div class="tnl-tabs__card">
				<h3 class="t-h3">{s.title}</h3>
				<p class="t-small">{s.summary}</p>
				<Chips items={s.items.slice(0, 3).map((i) => i.name)} />
				<a class="tnl-btn tnl-btn--block" href="/diensten/{s.slug}"
					>Meer over {s.title.toLowerCase()} <span class="tnl-btn__dot"><Icon name="arrow-up-right" /></span></a
				>
			</div>
		</div>
	{/each}
</div>
