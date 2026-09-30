import type { Action } from 'svelte/action';

/**
 * Contact form enhancement on form[data-tnl-form] (replaces the demo handler in tnl.js):
 * required fields get .tnl-field--error and focus moves to the first one; a valid form is sent
 * with fetch and swapped for its [data-tnl-success] sibling. Without JavaScript the form posts
 * normally and /api/submit redirects to /bedankt. `data-preview` (CMS preview) never sends.
 */
export const contactForm: Action<HTMLFormElement> = (form) => {
	const card = form.parentElement!;
	const success = card.querySelector<HTMLElement>('[data-tnl-success]');
	const failure = form.querySelector<HTMLElement>('[data-tnl-failure]');
	const button = form.querySelector<HTMLButtonElement>('button[type=submit]');

	function validate(): boolean {
		let first: HTMLElement | null = null;
		for (const input of form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[required]')) {
			const field = input.closest('.tnl-field');
			const bad = !input.value.trim() || !input.checkValidity();
			field?.classList.toggle('tnl-field--error', bad);
			input.setAttribute('aria-invalid', bad ? 'true' : 'false');
			const err = field?.querySelector<HTMLElement>('.tnl-field__error');
			if (err?.id) {
				const ids = new Set((input.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean));
				if (bad) ids.add(err.id);
				else ids.delete(err.id);
				if (ids.size) input.setAttribute('aria-describedby', [...ids].join(' '));
				else input.removeAttribute('aria-describedby');
			}
			if (bad && !first) first = input;
		}
		first?.focus();
		return !first;
	}

	async function onSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!validate() || form.hasAttribute('data-preview')) return;
		if (failure) failure.hidden = true;
		const label = button?.textContent ?? '';
		if (button) {
			button.disabled = true;
			button.textContent = 'Bezig met verzenden';
		}
		let ok: boolean;
		try {
			const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { accept: 'application/json' } });
			ok = res.ok && ((await res.json().catch(() => ({}))) as { ok?: boolean }).ok === true;
		} catch {
			ok = false;
		}
		if (button) {
			button.disabled = false;
			button.textContent = label;
		}
		if (ok && success) {
			form.hidden = true;
			success.hidden = false;
			success.focus();
		} else if (failure) {
			failure.hidden = false;
		}
	}

	form.addEventListener('submit', onSubmit);
	return { destroy: () => form.removeEventListener('submit', onSubmit) };
};
