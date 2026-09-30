/**
 * Zod schemas for `pages.blocks`, validated per slug in the CMS and at build time
 * (docs/cms-plan/03-database.md).
 */
import { z } from 'zod';

export const homeBlocks = z.object({
	eyebrow: z.string().max(80).default(''),
	statement: z.string().min(1, 'Vul de slogan in.').max(40),
	panelText: z.string().max(400).default(''),
	primaryLabel: z.string().max(40).default('Contacteer ons'),
	secondaryLabel: z.string().max(40).default('Onze diensten'),
	servicesTitle: z.string().max(60).default('Onze diensten'),
	servicesLead: z.string().max(300).default(''),
	projectsTitle: z.string().max(60).default('Ons werk'),
	projectsLead: z.string().max(300).default(''),
	faqTitle: z.string().max(60).default('Vragen?'),
	faqLead: z.string().max(300).default('')
});

export const aboutBlocks = z.object({
	statement: z.string().max(120).default(''),
	pillars: z
		.array(z.object({ title: z.string().min(1).max(60), text: z.string().min(1).max(300) }))
		.max(4, 'Maximaal vier punten.')
		.default([])
});

export const contactBlocks = z.object({
	privacyNotice: z.string().max(600).default('')
});

export const emptyBlocks = z.object({}).passthrough();

export const blockSchemas = {
	home: homeBlocks,
	'over-ons': aboutBlocks,
	contact: contactBlocks
} as const;

export function parseBlocks(slug: string, blocks: unknown) {
	const schema = (blockSchemas as Record<string, z.ZodType>)[slug] ?? emptyBlocks;
	return schema.safeParse(blocks ?? {});
}

export type HomeBlocksT = z.infer<typeof homeBlocks>;
export type AboutBlocksT = z.infer<typeof aboutBlocks>;
export type ContactBlocksT = z.infer<typeof contactBlocks>;
