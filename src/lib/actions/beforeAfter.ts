import type { Action } from 'svelte/action';

/**
 * Before/after slider: a figure holding input.tnl-ba__range. The native range input gives
 * arrow-key and screen-reader support; this only mirrors its value into --pos.
 */
export const beforeAfter: Action<HTMLElement> = (fig) => {
	const range = fig.querySelector<HTMLInputElement>('.tnl-ba__range');
	if (!range) return;
	const set = () => fig.style.setProperty('--pos', `${range.value}%`);
	range.addEventListener('input', set);
	set();
	return { destroy: () => range.removeEventListener('input', set) };
};
