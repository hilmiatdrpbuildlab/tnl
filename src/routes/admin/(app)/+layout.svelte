<script lang="ts">
	import { page } from '$app/state';
	import logoOnDark from '$lib/assets/logo/tnl-logo-on-dark.svg';
	import PublishBanner from '$lib/components/admin/PublishBanner.svelte';

	let { data, children } = $props();
	const nav = [
		{ href: '/admin', label: 'Overzicht', exact: true },
		{ group: 'Inhoud' },
		{ href: '/admin/paginas', label: "Pagina's" },
		{ href: '/admin/diensten', label: 'Diensten' },
		{ href: '/admin/projecten', label: 'Projecten' },
		{ href: '/admin/reviews', label: 'Reviews' },
		{ href: '/admin/faq', label: 'FAQ' },
		{ href: '/admin/cijfers', label: 'Cijfers' },
		{ href: '/admin/blog', label: 'Blog' },
		{ href: '/admin/media', label: 'Media' },
		{ group: 'Beheer' },
		{ href: '/admin/berichten', label: 'Berichten', badge: 'unread' },
		{ href: '/admin/seo', label: 'SEO & redirects' },
		{ href: '/admin/instellingen', label: 'Instellingen' },
		{ href: '/admin/account', label: 'Account' }
	] as const;
	const isCurrent = (href: string, exact = false) =>
		exact ? page.url.pathname === href : page.url.pathname === href || page.url.pathname.startsWith(href + '/');
</script>

<div class="adm">
	<aside class="adm-side">
		<a class="adm-side__brand" href="/admin"><img src={logoOnDark} alt="TNL Group" width="61" height="32" /><span>CMS</span></a>
		<nav class="adm-nav" aria-label="CMS">
			{#each nav as item, i (i)}
				{#if 'group' in item}
					<span class="adm-nav__group">{item.group}</span>
				{:else}
					<a href={item.href} aria-current={isCurrent(item.href, 'exact' in item) ? 'page' : undefined}>
						{item.label}
						{#if 'badge' in item && data.unread > 0}<span class="adm-count" aria-label="{data.unread} ongelezen">{data.unread}</span>{/if}
					</a>
				{/if}
			{/each}
		</nav>
		<div class="adm-side__foot">
			{data.user.name || data.user.email}<br />
			<a href="/" target="_blank" rel="noopener">Bekijk de website</a>
		</div>
	</aside>
	<div class="adm-main">
		<PublishBanner unpublished={data.unpublished} build={data.build} buildLogUrl={data.buildLogUrl} />
		<main class="adm-content" id="main">
			{@render children()}
		</main>
	</div>
</div>
