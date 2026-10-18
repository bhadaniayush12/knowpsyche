import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// UX-2: after the scored run the arena takes no answers, so it is greyed (data-done) and loses its pointer
// cursor; a restart brings it back. The arena is a region, not a control, so there is no disabled state.
// These pin the wiring in the page source.

const root = fileURLToPath(new URL('../../../', import.meta.url));
const page = readFileSync(join(root, 'src/pages/attention-span-test/index.astro'), 'utf8');
const script = page.slice(page.indexOf('<script>'));
const fn = (name: string) => {
  const start = script.indexOf(`function ${name}(`);
  return script.slice(start, script.indexOf('\n  }\n', start));
};

describe('Attention span finished run', () => {
  it('the finished run greys the arena before the result renders', () => {
    expect(fn('finishMainTest')).toMatch(/mode = 'done';[\s\S]*arena\.setAttribute\('data-done', ''\);[\s\S]*renderResults\(scores\);/);
  });

  it('every restart clears it', () => {
    expect(fn('restartAll')).toContain("arena.removeAttribute('data-done');");
  });

  it('focus still lands on the result headline', () => {
    expect(fn('renderResults')).toContain('headline.focus({ preventScroll: true });');
  });

  it('the greyed arena uses design tokens and drops the pointer cursor', () => {
    const rule = page.match(/\.as-arena\[data-done\] \{([^}]*)\}/)?.[1] ?? '';
    expect(rule).toContain('var(--color-line-inner)');
    expect(rule).toContain('var(--color-line-row)');
    expect(rule).toContain('cursor: default');
  });
});
