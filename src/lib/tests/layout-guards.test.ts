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
