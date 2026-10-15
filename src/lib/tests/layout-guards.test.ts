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
