import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Q6-4: the "Copy my scores" text of every test names its canonical URL, with the trailing slash.

const root = fileURLToPath(new URL('../../../', import.meta.url));
const slugs = [
  'reaction-time-test',
  'enneagram-test',
  'photographic-memory-test',
  'number-memory-test',
  'attention-span-test',
  'stroop-test',
  'emotional-intelligence-test',
];

/** The code that builds the copied text: the bindCopy callback, or the copyText it returns. */
const copySource = (slug: string) => {
  const page = readFileSync(join(root, `src/pages/${slug}/index.astro`), 'utf8');
  const script = page.slice(page.indexOf('<script>'));
  const parts = [script.slice(script.indexOf('bindCopy('), script.indexOf('bindCopy(') + 900)];
  const at = script.indexOf('copyText = [');
  if (at > -1) parts.push(script.slice(at, script.indexOf("].join('\\n')", at)));
  return parts.join('\n');
};

describe.each(slugs)('%s copy text (Q6-4)', (slug) => {
  const src = copySource(slug);

  it('names the canonical URL with its trailing slash', () => {
    expect(src).toContain(`knowpsyche.com/${slug}/`);
  });

  it('never without it', () => {
    expect(src).not.toMatch(new RegExp(`knowpsyche\\.com/${slug}(?!/)`));
  });
});
