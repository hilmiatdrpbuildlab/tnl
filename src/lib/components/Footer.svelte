<script lang="ts">
	import type { Service, SiteSettings } from '$lib/types';
	import { telHref } from '$lib/format';
	import Icon from './icons/Icon.svelte';
	import Logo from './Logo.svelte';

	interface Props {
		settings: SiteSettings;
		services: Pick<Service, 'slug' | 'title'>[];
		showBlog?: boolean;
	}
	let { settings, services, showBlog = false }: Props = $props();
	const c = $derived(settings.company);
	const year = new Date().getFullYear();
</script>

<footer class="tnl-footer" data-theme="forest">
	<div class="tnl-container">
		<div class="tnl-footer__top">
			<div class="tnl-footer__brand">
				<Logo variant="on-dark" width={220} />
				<p>Kwaliteit en service gaan hand in hand. Tuinaanleg, onderhoud en klusjesdienst.</p>
			</div>
			<div class="tnl-footer__cols">
				<div class="tnl-footer__col">
					<h3>Navigatie</h3>
					<ul>
						<li><a href="/diensten">Diensten</a></li>
						<li><a href="/projecten">Projecten</a></li>
						<li><a href="/over-ons">Over ons</a></li>
						{#if showBlog}<li><a href="/blog">Blog</a></li>{/if}
						<li><a href="/contact">Contact</a></li>
					</ul>
				</div>
				<div class="tnl-footer__col">
					<h3>Diensten</h3>
					<ul>
						{#each services as s (s.slug)}<li><a href="/diensten/{s.slug}">{s.title}</a></li>{/each}
					</ul>
				</div>
				<div class="tnl-footer__col">
					<h3>Contact</h3>
					<ul>
						<li>{c.street}<br />{c.postcode} {c.city}</li>
						<li><a href="mailto:{c.email}">{c.email}</a></li>
						<li><a href={telHref(c.phone)}>{c.phone}</a></li>
					</ul>
					{#if settings.socials.facebook || settings.socials.instagram}
						<div class="tnl-socials" style="margin-top: var(--space-4)">
							{#if settings.socials.facebook}
								<a href={settings.socials.facebook} aria-label="TNL Group op Facebook" rel="noopener"
									><Icon name="facebook" /></a
								>
							{/if}
							{#if settings.socials.instagram}
								<a href={settings.socials.instagram} aria-label="TNL Group op Instagram" rel="noopener"
									><Icon name="instagram" /></a
								>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
		<div class="tnl-footer__bottom">
			<span>© {year} {c.name}</span>
			{#if c.companyNumber}<span>Ondernemingsnummer: {c.companyNumber}</span>{/if}
		</div>
	</div>
</footer>
