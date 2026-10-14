// Content collections. `learn` = the articles in src/content/learn/*.md (the Learn section).
// The build fails on a missing or malformed field, so a broken article never ships.
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { homeTests } from './data/home';

/** Test slugs, e.g. `reaction-time-test`, from the shared test list. */
const testSlugs = homeTests.map((t) => t.href.replace(/\//g, '')) as [string, ...string[]];

const learn = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/learn' }),
  schema: z
    .object({
      // ≤ 47 so the page <title> ("<title> | KnowPsyche") stays within 60 characters.
      title: z.string().min(1).max(47),
      /** Word(s) of the title set in the blue serif, as in the design's H1. */
      em: z.string().min(1).optional(),
      /** The line under the H1. Falls back to the description. */
      deck: z.string().min(1).optional(),
      description: z.string().min(1).max(155),
      datePublished: z.coerce.date(),
      dateModified: z.coerce.date(),
      /** Short phrase: the kicker above the H1 and the group heading on /learn/. */
      category: z.string().min(1).max(30),
      /** The test this article goes with. Optional for the pillar article. */
      relatedTest: z.enum(testSlugs).optional(),
      /** Optional slug of an illustration component in src/components/learn/scenes/. */
      scene: z.string().min(1).optional(),
      related: z.array(reference('learn')).max(2).default([]),
      /** A citation string (*italic* allowed, as on the test pages) or a linked { title, url }. */
      sources: z.array(z.union([z.string().min(1), z.object({ title: z.string().min(1), url: z.url() })])).min(1),
      faq: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).optional(),
      draft: z.boolean(),
    })
    .refine((d) => !d.em || d.title.includes(d.em), {
      message: 'em must be part of the title',
      path: ['em'],
    })
    .refine((d) => d.dateModified >= d.datePublished, {
      message: 'dateModified is before datePublished',
      path: ['dateModified'],
    }),
});

export const collections = { learn };
