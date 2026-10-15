import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { homeTests } from '../../data/home';

// Q4-A1: small text must pass AA (4.5:1). Token values are read from global.css, so a token change is checked too.

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const css = read('src/styles/global.css');

/** `var(--color-x)` or `x` → its hex value in @theme. */
function token(ref: string): string {
  const name = ref.replace(/^var\(--color-(.+)\)$/, '$1');
  const m = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`no token --color-${name}`);
  return m[1];
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const ratio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

describe('contrast of small text (AA 4.5:1)', () => {
  it('has a working ratio helper', () => {
    expect(ratio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(ratio(token('violet'), token('white'))).toBeLessThan(4.5);
  });

  it.each(homeTests.filter((t) => !t.dark).map((t) => [t.name, t.color!] as const))(
    '%s card chip text (%s) on the white chip',
    (_name, color) => expect(ratio(token(color), token('white'))).toBeGreaterThanOrEqual(4.5),
  );

  it('chip text is set from test.color on a white chip in Card and ArticleCard', () => {
    expect(read('src/components/ui/Card.astro')).toContain('{ color: test.color }');
    const article = read('src/components/learn/ArticleCard.astro');
    expect(article.match(/\{ color: test\.color \}/g)).toHaveLength(3);
  });

  it('Enneagram time-left line uses full text-muted on the white card', () => {
    const page = read('src/pages/enneagram-test/index.astro');
    expect(page).toContain('class="en-left text-muted"');
    expect(ratio(token('muted'), token('white'))).toBeGreaterThanOrEqual(4.5);
  });

  it('Stroop card glyph word uses coral-ink on the red tint', () => {
    expect(read('src/components/home/TestGlyph.astro')).toContain('st-w1 text-coral-ink');
    expect(ratio(token('coral-ink'), token('tint-red'))).toBeGreaterThanOrEqual(4.5);
  });
});
