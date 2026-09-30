<script lang="ts">
	import { mobileMenu } from '$lib/actions/mobileMenu';
	import { telHref } from '$lib/format';
	import Icon from './icons/Icon.svelte';
	import Logo from './Logo.svelte';

	interface Props {
		/** Current path, to mark the page link with aria-current. */
		path: string;
		phone: string;
		/** Use on a photo hero or a Forest ground. */
		onDark?: boolean;
		/** The blog link shows only when at least one post is published. */
		showBlog?: boolean;
	}
	let { path, phone, onDark = false, showBlog = false }: Props = $props();

	const links = $derived([
		{ href: '/diensten', label: 'Diensten' },
		{ href: '/projecten', label: 'Projecten' },
		{ href: '/over-ons', label: 'Over ons' },
		...(showBlog ? [{ href: '/blog', label: 'Blog' }] : []),
		{ href: '/contact', label: 'Contact' }
	]);
	const isCurrent = (href: string) => path === href || path.startsWith(href + '/');
</script>

<header class="tnl-header" use:mobileMenu>
	<a class="tnl-header__logo" href="/" aria-label="TNL Group, naar de homepage">
		<Logo variant={onDark ? 'on-dark' : 'default'} width={88} />
	</a>
	<nav class="tnl-nav" aria-label="Hoofdmenu">
		{#each links as link (link.href)}
			<a href={link.href} aria-current={isCurrent(link.href) ? 'page' : undefined}>{link.label}</a>
		{/each}
	</nav>
	<div class="tnl-header__actions">
		<a class="tnl-header__phone" href={telHref(phone)}>{phone}</a>
		<a class="tnl-btn tnl-btn--sm" href="/contact"
			>Contacteer ons <span class="tnl-btn__dot"><Icon name="arrow-up-right" /></span></a
		>
		<button class="tnl-menu-btn" type="button" aria-expanded="false" aria-label="Menu openen">
			<Icon name="menu" class="tnl-icon--open" /><Icon name="x" class="tnl-icon--close" />
		</button>
	</div>
	<div class="tnl-drawer">
		{#each links as link (link.href)}
			<a href={link.href} aria-current={isCurrent(link.href) ? 'page' : undefined}
				>{link.label} <Icon name="arrow-right" /></a
			>
		{/each}
		<a class="tnl-btn tnl-btn--block" href={telHref(phone)}>Bel {phone}</a>
	</div>
</header>
