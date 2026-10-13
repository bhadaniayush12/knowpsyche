// Collection access for pages (needs Astro, so it's kept apart from the pure helpers in ./articles).
import { getCollection, type CollectionEntry } from 'astro:content';
import { homeTests, type HomeTest } from '../../data/home';
import { published } from './articles';

export type Article = CollectionEntry<'learn'>;

/** Every published article (drafts never reach a page), most recently updated first. */
export const getArticles = async (): Promise<Article[]> => published(await getCollection('learn'));

/** The test an article goes with, from the shared test list. */
export const testFor = (article: Article): HomeTest | undefined =>
  article.data.relatedTest ? homeTests.find((t) => t.href === `/${article.data.relatedTest}/`) : undefined;

/** "14 October 2026" */
export const formatDate = (d: Date): string =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
