import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

export default ts.config(
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } }
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	},
	{
		rules: {
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			// Every href in this app is a plain internal path; resolve() adds nothing without a base path.
			'svelte/no-navigation-without-resolve': 'off'
		}
	},
	{
		// Icon bodies are the design system's own SVG files, not user content.
		files: ['src/lib/components/icons/Icon.svelte'],
		rules: { 'svelte/no-at-html-tags': 'off' }
	},
	{
		ignores: ['.wrangler/', '.local-bucket/', 'test-results/', '.svelte-kit/', 'build/', 'drizzle/', 'node_modules/', 'static/', 'src/lib/styles/', 'playwright-report/']
	}
);
