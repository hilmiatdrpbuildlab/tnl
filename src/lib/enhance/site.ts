/**
 * The only JavaScript the public site ships (about 3 kB): the prerendered pages are plain HTML
 * (csr = false), and this applies the same Svelte actions the components use in the CMS preview.
 * Built by scripts/build-enhance.ts into static/site.<hash>.js.
 */
import { beforeAfter } from '../actions/beforeAfter';
import { contactForm } from '../actions/contactForm';
import { mobileMenu } from '../actions/mobileMenu';
import { tabs } from '../actions/tabs';

function init() {
	document.querySelectorAll<HTMLElement>('[data-tnl-tabs]').forEach((el) => tabs(el));
	document.querySelectorAll<HTMLElement>('[data-tnl-ba]').forEach((el) => beforeAfter(el));
	document.querySelectorAll<HTMLElement>('.tnl-header').forEach((el) => mobileMenu(el));
	document.querySelectorAll<HTMLFormElement>('form[data-tnl-form]').forEach((el) => contactForm(el));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
