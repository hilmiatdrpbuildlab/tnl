import type { Action } from 'svelte/action';

/**
 * Mobile menu on .tnl-header: the .tnl-menu-btn toggles [data-open]; Escape closes the menu
 * and returns focus to the button. Following a drawer link also closes it.
 */
export const mobileMenu: Action<HTMLElement> = (header) => {
	const btn = header.querySelector<HTMLButtonElement>('.tnl-menu-btn');
	if (!btn) return;

	function setOpen(open: boolean) {
		header.toggleAttribute('data-open', open);
		btn!.setAttribute('aria-expanded', open ? 'true' : 'false');
		btn!.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
	}
	const onClick = () => setOpen(!header.hasAttribute('data-open'));
	const onKey = (e: KeyboardEvent) => {
		if (e.key === 'Escape' && header.hasAttribute('data-open')) {
			setOpen(false);
			btn.focus();
		}
	};
	const onDrawerClick = (e: MouseEvent) => {
		if ((e.target as HTMLElement).closest('.tnl-drawer a')) setOpen(false);
	};
	btn.addEventListener('click', onClick);
	header.addEventListener('keydown', onKey);
	header.addEventListener('click', onDrawerClick);
	return {
		destroy() {
			btn.removeEventListener('click', onClick);
			header.removeEventListener('keydown', onKey);
			header.removeEventListener('click', onDrawerClick);
		}
	};
};
