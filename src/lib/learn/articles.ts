// Pure helpers for the Learn section. They take plain objects (the parts of a collection entry they need),
// so Vitest can run them without Astro.

/** The parts of a `learn` entry these helpers read. */
export interface ArticleLike {
  id: string;
  data: { draft: boolean; dateModified: Date; category: string; relatedTest?: string; scene?: string };
}

/** Published articles only (no drafts), most recently updated first. Ties keep a stable order by id. */
export const published = <T extends ArticleLike>(entries: T[]): T[] =>
  entries
    .filter((e) => !e.data.draft)
    .sort((a, b) => b.data.dateModified.getTime() - a.data.dateModified.getTime() || a.id.localeCompare(b.id));

const WORDS_PER_MINUTE = 220;

/** "5 min read" from the raw markdown: words in the text, ignoring markup and link targets. */
export const readingTime = (markdown: string): string => {
  const text = markdown
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/[#>*_`|[\]-]/g, ' ');
  const words = text.split(/\s+/).filter((w) => /\w/.test(w)).length;
  return `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min read`;
};

/**
 * Splits rendered article HTML before each top-level <h2>, so something can go *between* sections
 * (never inside a paragraph). The first chunk is everything before the first h2 (the lead).
 */
export const splitAtH2 = (html: string): string[] => html.split(/(?=<h2[\s>])/).filter((c) => c.trim() !== '');

const CALLOUTS: Record<string, { tag: string; cls: string; label: string }> = {
  'key idea': { tag: 'div', cls: 'callout callout-key', label: 'Key idea' },
  'side note': { tag: 'aside', cls: 'callout callout-side', label: 'Side note' },
};

/**
 * Callouts and tables for the rendered article body (Astro's own Markdown output, so a regex is enough).
 * - A blockquote whose first words are bold "Key idea" or "Side note" becomes that callout from
 *   docs/design/Article.dc.html. Any other blockquote stays a blockquote (the serif pull quote).
 * - Each table gets a scroll wrapper, so a wide table never widens the page on a phone.
 */
export const enhanceArticleHtml = (html: string): string =>
  html
    .replace(/<blockquote>([\s\S]*?)<\/blockquote>/g, (quote, inner: string) => {
      const m = inner.match(/^\s*<p>\s*<strong>([^<]+)<\/strong>(?:\s|<br\s*\/?>)*/);
      const kind = m && CALLOUTS[m[1].trim().replace(/[.:]$/, '').toLowerCase()];
      if (!m || !kind) return quote;
      const body = ('<p>' + inner.slice(m[0].length)).replace(/<p>\s*<\/p>/g, '').trim();
      return `<${kind.tag} class="${kind.cls}"><p class="callout-label">${kind.label}</p>${body}</${kind.tag}>`;
    })
    .replace(/<table>[\s\S]*?<\/table>/g, (table) => `<div class="table-wrap" tabindex="0" role="region" aria-label="Table">${table}</div>`);

/**
 * Drops a last paragraph that only repeats `line` (e.g. an article ending with the "not medical advice"
 * line, which the article template already prints under Sources). Tags, curly quotes and a final full
 * stop don't matter.
 */
export const dropTrailingLine = (html: string, line: string): string => {
  const norm = (s: string) => s.replace(/<[^>]+>/g, '').replace(/[’‘]/g, "'").replace(/[.\s]+$/, '').trim().toLowerCase();
  const m = html.match(/<p>((?:(?!<p>)[\s\S])*?)<\/p>\s*$/);
  return m && norm(m[1]) === norm(line) ? html.slice(0, m.index).trimEnd() : html;
};

/** "In this guide": the h2 headings, numbered 01, 02, … */
export const tocFromHeadings = (headings: { depth: number; slug: string; text: string }[]) =>
  headings
    .filter((h) => h.depth === 2)
    .map((h, i) => ({ slug: h.slug, text: h.text, num: String(i + 1).padStart(2, '0') }));

/** Groups articles by category, keeping each category where its first article appears. */
export const byCategory = <T extends ArticleLike>(entries: T[]): { category: string; items: T[] }[] => {
  const groups = new Map<string, T[]>();
  for (const e of entries) groups.set(e.data.category, [...(groups.get(e.data.category) ?? []), e]);
  return [...groups].map(([category, items]) => ({ category, items }));
};

/** Published articles that go with a test, e.g. `reaction-time-test`. */
export const articlesForTest = <T extends ArticleLike>(entries: T[], slug: string): T[] =>
  published(entries).filter((e) => e.data.relatedTest === slug);
