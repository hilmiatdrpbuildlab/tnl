import type { Action } from 'svelte/action';

/**
 * Tabs: a container holding role="tab" buttons (aria-controls) and role="tabpanel" panels.
 * Click selects; ArrowLeft/ArrowRight move and focus, wrapping around (as design-system tnl.js).
 * Home/End jump to the first/last tab.
 */
export const tabs: Action<HTMLElement> = (box) => {
	const list = Array.from(box.querySelectorAll<HTMLElement>('[role="tab"]'));

	function select(tab: HTMLElement, focus: boolean) {
		for (const t of list) {
			const on = t === tab;
			t.setAttribute('aria-selected', on ? 'true' : 'false');
			t.tabIndex = on ? 0 : -1;
			const id = t.getAttribute('aria-controls');
			const panel = id ? box.querySelector<HTMLElement>(`#${CSS.escape(id)}`) : null;
			if (panel) panel.hidden = !on;
		}
		if (focus) tab.focus();
	}

	const cleanups = list.map((tab, i) => {
		const onClick = () => select(tab, false);
		const onKey = (e: KeyboardEvent) => {
			let next: number | null = null;
			if (e.key === 'ArrowRight') next = i + 1;
			else if (e.key === 'ArrowLeft') next = i - 1;
			else if (e.key === 'Home') next = 0;
			else if (e.key === 'End') next = list.length - 1;
			if (next === null) return;
			e.preventDefault();
			select(list[(next + list.length) % list.length], true);
		};
		tab.addEventListener('click', onClick);
		tab.addEventListener('keydown', onKey);
		return () => {
			tab.removeEventListener('click', onClick);
			tab.removeEventListener('keydown', onKey);
		};
	});

	return { destroy: () => cleanups.forEach((c) => c()) };
};
