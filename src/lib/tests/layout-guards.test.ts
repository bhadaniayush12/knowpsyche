import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Q4-A layout guards: markup that keeps small and zoomed screens from scrolling sideways or overflowing.
// The browser runs (320/360/390, 200% text) check the result; these stop the classes from being dropped.

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = (p: string) => readFileSync(join(root, p), 'utf8');

describe('number memory views (Q4-A4)', () => {
  it('the stacked views sit in one column capped at the card width', () => {
    expect(read('src/pages/number-memory-test/index.astro')).toMatch(/class="nm-views [^"]*\bgrid grid-cols-\[minmax\(0,1fr\)\]/);
  });
});

describe('without JavaScript (Q4-A6)', () => {
  it('the js flag is set inline at the top of <head>, before any stylesheet', () => {
    const layout = read('src/layouts/BaseLayout.astro');
    const head = layout.slice(layout.indexOf('<head>'));
    expect(head).toMatch(/^<head>\s+<meta charset="utf-8" \/>\s+<script is:inline>document\.documentElement\.classList\.add\('js'\);<\/script>/);
  });

  it('the scroll reveal hides content only under html.js', () => {
    const css = read('src/styles/global.css');
    expect(css).toMatch(/@supports \(animation-timeline: view\(\)\) \{\s+\.js \.reveal \{\s+animation: rise/);
    expect(css).not.toMatch(/^\s*\.reveal \{\s+animation/m);
  });

  it('every test page says the test needs JavaScript, in a <noscript> near Start', async () => {
    const { NOSCRIPT_LINE } = await import('../../data/shared');
    expect(NOSCRIPT_LINE).toBe('This test needs JavaScript. Please turn it on and reload the page.');
    expect(NOSCRIPT_LINE).not.toMatch(/[—–]/);
    const layout = read('src/layouts/TestPage.astro');
    const start = layout.search(/<button\s+type="button"\s+data-test-start/);
    const ns = layout.indexOf('<noscript><p');
    expect(start).toBeGreaterThan(0);
    expect(ns).toBeGreaterThan(start);
    expect(ns - start).toBeLessThan(600);
    expect(layout.slice(ns, layout.indexOf('</noscript>', ns))).toContain('{NOSCRIPT_LINE}');
  });
});

describe('tap targets of at least 44px (Q4-A7)', () => {
  it('homepage FAQ question: 26px line + 2 × 10px padding, pulled back by the same negative margin so nothing moves', () => {
    expect(read('src/components/home/ResultsFaq.astro')).toContain('<summary class="-my-2.5 flex justify-between gap-3 py-2.5 text-[17px] font-semibold">');
  });

  it('article contents links are at least 44px tall', () => {
    expect(read('src/pages/learn/[slug].astro')).toMatch(/<a href=\{`#\$\{t\.slug\}`\}[^>]*class="flex min-h-11 items-center/);
  });

  it('article header "Learn" link gets the invisible 44px tap area', () => {
    expect(read('src/pages/learn/[slug].astro')).toContain('<a href="/learn/" class="hit-44 text-muted">Learn</a>');
    expect(read('src/styles/global.css')).toMatch(/\.hit-44::after \{[^}]*width: max\(100%, 44px\);\s+height: max\(100%, 44px\);/);
  });
});

describe('200% text: rows wrap instead of overflowing (Q4-A8)', () => {
  it('the header wraps', () => {
    expect(read('src/components/Header.astro')).toContain("'relative mx-auto flex flex-wrap items-center justify-between gap-4");
  });

  it.each(['attention-span-test', 'stroop-test'])('%s: Sound & vibration + Restart wrap', (slug) => {
    expect(read(`src/pages/${slug}/index.astro`)).toMatch(/<div class="flex flex-wrap gap-2">\s+<!--[^>]*-->\s+<FeedbackToggle class="grow basis-0" \/>/);
  });

  it('emotional intelligence: count, Back + Restart wrap', () => {
    const page = read('src/pages/emotional-intelligence-test/index.astro');
    expect(page).toMatch(/<div class="flex flex-wrap items-center justify-between gap-3">\s+<span class="eq-count[^>]*>[^<]*<\/span>\s+<div class="flex flex-wrap gap-2">/);
  });

  it('enneagram: Back + Restart wrap', () => {
    expect(read('src/pages/enneagram-test/index.astro')).toContain(`<div class="flex flex-wrap gap-2">\n        <button type="button" class:list={['en-back', btnSmall]} disabled>`);
  });

  it('the Learn hub pillar title is never cut off', () => {
    const card = read('src/components/learn/ArticleCard.astro');
    const title = card.match(/<H class="m-0 mb-2 font-semibold text-\[clamp\(26px,3\.2vw,44px\)\][^"]*"/)![0];
    expect(title).not.toContain('line-clamp');
  });
});
