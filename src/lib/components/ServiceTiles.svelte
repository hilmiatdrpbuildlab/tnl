<script lang="ts">
	import Image from './Image.svelte';
	import type { Service } from '$lib/types';
	
	import Icon from './icons/Icon.svelte';
	import TextLink from './TextLink.svelte';

	/** The services as tall tiles. Each tile gets its own ground: photo (Forest), Olive or Light. */
	let { services }: { services: Service[] } = $props();
</script>

<div class="tnl-tiles">
	{#each services as s (s.id)}
		{@const photo = s.tileTheme === 'forest' ? s.hero : null}
		<article class="tnl-tile" data-theme={s.tileTheme === 'light' ? undefined : s.tileTheme}>
			{#if photo}
				<Image class="tnl-tile__media" img={photo} sizes='(max-width: 980px) 100vw, 33vw' alt="" loading="lazy" />
			{/if}
			<div class="tnl-tile__head">
				<h3 class="t-h3">{s.title}</h3>
				<p class="t-small">{s.summary}</p>
			</div>
			<div class="tnl-tile__foot">
				{#if s.items.length}
					<ul class="tnl-plus-list">
						{#each s.items as item, i (i)}
							<li>
								<Icon name="plus" />
								<div><strong>{item.name}</strong>{#if item.detail} <span>{item.detail}</span>{/if}</div>
							</li>
						{/each}
					</ul>
				{/if}
				<TextLink href="/diensten/{s.slug}">Meer over {s.title.toLowerCase()}</TextLink>
			</div>
		</article>
	{/each}
</div>
