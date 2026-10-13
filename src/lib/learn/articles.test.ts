import { describe, expect, it } from 'vitest';
import { articlesForTest, byCategory, dropTrailingLine, enhanceArticleHtml, published, readingTime, splitAtH2, tocFromHeadings, type ArticleLike } from './articles';

const a = (id: string, o: Partial<ArticleLike['data']> = {}): ArticleLike => ({
  id,
  data: { draft: false, dateModified: new Date('2026-10-01'), category: 'Memory', ...o },
});

describe('published', () => {
  it('returns nothing for no articles', () => {
    expect(published([])).toEqual([]);
  });
  it('drops drafts', () => {
    expect(published([a('x', { draft: true }), a('y')]).map((e) => e.id)).toEqual(['y']);
  });
  it('returns nothing when every article is a draft', () => {
    expect(published([a('x', { draft: true }), a('y', { draft: true })])).toEqual([]);
  });
  it('sorts newest first, ties by id', () => {
    const list = [a('b'), a('c', { dateModified: new Date('2026-10-05') }), a('a')];
    expect(published(list).map((e) => e.id)).toEqual(['c', 'a', 'b']);
  });
});

describe('readingTime', () => {
  it('is at least 1 minute', () => {
    expect(readingTime('')).toBe('1 min read');
    expect(readingTime('Just a few words.')).toBe('1 min read');
  });
  it('rounds words / 220', () => {
    expect(readingTime(Array(1100).fill('word').join(' '))).toBe('5 min read');
  });
  it('ignores markup and link targets', () => {
    const md = `## Heading\n\n> **Key idea** [link](/a-very-long-url-that-is-not-words/) | --- |`;
    expect(readingTime(md)).toBe('1 min read');
  });
});

describe('splitAtH2', () => {
  it('keeps html with no h2 as one chunk', () => {
    expect(splitAtH2('<p>Lead</p>')).toEqual(['<p>Lead</p>']);
  });
  it('splits before each h2, lead first', () => {
    expect(splitAtH2('<p>Lead</p><h2 id="a">A</h2><p>x</p><h2 id="b">B</h2>')).toEqual([
      '<p>Lead</p>',
      '<h2 id="a">A</h2><p>x</p>',
      '<h2 id="b">B</h2>',
    ]);
  });
  it('handles a single h2 with no lead', () => {
    expect(splitAtH2('<h2 id="a">A</h2><p>x</p>')).toEqual(['<h2 id="a">A</h2><p>x</p>']);
  });
  it('does not split at h3', () => {
    expect(splitAtH2('<p>a</p><h3>b</h3>')).toHaveLength(1);
  });
  it('returns nothing for empty html', () => {
    expect(splitAtH2('')).toEqual([]);
  });
});

describe('enhanceArticleHtml', () => {
  it('turns a bold "Key idea" blockquote into the key callout', () => {
    expect(enhanceArticleHtml('<blockquote>\n<p><strong>Key idea</strong> Thinking moves you on.</p>\n</blockquote>')).toBe(
      '<div class="callout callout-key"><p class="callout-label">Key idea</p><p>Thinking moves you on.</p></div>',
    );
  });
  it('turns "Side note" into an aside, ignoring case, a colon and a line break', () => {
    expect(enhanceArticleHtml('<blockquote><p><strong>side note:</strong>\nA note.</p></blockquote>')).toBe(
      '<aside class="callout callout-side"><p class="callout-label">Side note</p><p>A note.</p></aside>',
    );
  });
  it('drops the empty paragraph when the label stands alone', () => {
    expect(enhanceArticleHtml('<blockquote><p><strong>Key idea</strong></p><p>Body.</p></blockquote>')).toBe(
      '<div class="callout callout-key"><p class="callout-label">Key idea</p><p>Body.</p></div>',
    );
  });
  it('leaves pull quotes and other bold openings alone', () => {
    const quote = '<blockquote><p>A pull quote.</p></blockquote>';
    const bold = '<blockquote><p><strong>Important</strong> text</p></blockquote>';
    expect(enhanceArticleHtml(quote)).toBe(quote);
    expect(enhanceArticleHtml(bold)).toBe(bold);
  });
  it('handles several blockquotes independently', () => {
    const out = enhanceArticleHtml('<blockquote><p>Quote</p></blockquote><p>x</p><blockquote><p><strong>Key idea</strong> K</p></blockquote>');
    expect(out).toContain('<blockquote><p>Quote</p></blockquote>');
    expect(out).toContain('callout-key');
  });
  it('wraps tables in a scroll region', () => {
    expect(enhanceArticleHtml('<table><tr><td>1</td></tr></table>')).toBe(
      '<div class="table-wrap" tabindex="0" role="region" aria-label="Table"><table><tr><td>1</td></tr></table></div>',
    );
  });
});

describe('dropTrailingLine', () => {
  const line = 'For learning and self-reflection, not medical advice.';
  it('drops a last paragraph that repeats the line, italic or not', () => {
    expect(dropTrailingLine('<p>Body.</p>\n<p><em>For learning and self-reflection, not medical advice.</em></p>\n', line)).toBe('<p>Body.</p>');
    expect(dropTrailingLine('<p>Body.</p><p>For learning and self-reflection, not medical advice</p>', line)).toBe('<p>Body.</p>');
  });
  it('keeps everything else', () => {
    const html = '<p>For learning and self-reflection, not medical advice.</p><p>Last words.</p>';
    expect(dropTrailingLine(html, line)).toBe(html);
    expect(dropTrailingLine('', line)).toBe('');
  });
});

describe('tocFromHeadings', () => {
  it('lists h2s only, numbered', () => {
    const toc = tocFromHeadings([
      { depth: 2, slug: 'a', text: 'A' },
      { depth: 3, slug: 'a1', text: 'A1' },
      { depth: 2, slug: 'b', text: 'B' },
    ]);
    expect(toc).toEqual([
      { slug: 'a', text: 'A', num: '01' },
      { slug: 'b', text: 'B', num: '02' },
    ]);
  });
  it('is empty with no h2', () => {
    expect(tocFromHeadings([{ depth: 3, slug: 'x', text: 'X' }])).toEqual([]);
  });
});

describe('byCategory', () => {
  it('groups in first-seen order', () => {
    const groups = byCategory([a('1', { category: 'B' }), a('2', { category: 'A' }), a('3', { category: 'B' })]);
    expect(groups.map((g) => [g.category, g.items.map((e) => e.id)])).toEqual([
      ['B', ['1', '3']],
      ['A', ['2']],
    ]);
  });
  it('is empty with no articles', () => {
    expect(byCategory([])).toEqual([]);
  });
});

describe('articlesForTest', () => {
  const list = [
    a('one', { relatedTest: 'stroop-test' }),
    a('two', { relatedTest: 'stroop-test', draft: true }),
    a('pillar'),
    a('three', { relatedTest: 'stroop-test', dateModified: new Date('2026-10-09') }),
  ];
  it('finds published articles for the test, newest first', () => {
    expect(articlesForTest(list, 'stroop-test').map((e) => e.id)).toEqual(['three', 'one']);
  });
  it('finds none for a test without articles', () => {
    expect(articlesForTest(list, 'enneagram-test')).toEqual([]);
  });
});
