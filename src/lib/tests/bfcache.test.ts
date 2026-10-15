import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Q6-5: a page restored by Back/Forward from the cache gets no storage event in every browser, so the trail and
// the report refresh on a persisted pageshow. The save box is covered in save-box.test.ts; the Chromium run
// (raw CDP, real bfcache) checks the behaviour.

const root = fileURLToPath(new URL('../../../', import.meta.url));
const read = (p: string) => readFileSync(join(root, p), 'utf8');

describe.each([
  ['progress trail', 'src/components/result/ProgressTrail.astro', 'update'],
  ['report page', 'src/pages/report/index.astro', 'render'],
])('%s (Q6-5)', (_name, file, refresh) => {
  it(`calls ${refresh}() on a persisted pageshow`, () => {
    expect(read(file)).toMatch(new RegExp(`addEventListener\\('pageshow', \\(e\\) => \\{\\s+if \\(e\\.persisted\\) ${refresh}\\(\\);\\s+\\}\\);`));
  });
});
