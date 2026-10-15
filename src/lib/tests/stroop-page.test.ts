import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Q5-B: when the scored run ends, the last word leaves the arena before the result shows, so no coloured
// word sits above the score. The browser run (Chromium + WebKit, axe on the result) checks the behaviour;
// these pin the wiring in the page source.

const root = fileURLToPath(new URL('../../../', import.meta.url));
const page = readFileSync(join(root, 'src/pages/stroop-test/index.astro'), 'utf8');
const script = page.slice(page.indexOf('<script>'));
const fn = (name: string) => {
  const start = script.indexOf(`function ${name}(`);
  return script.slice(start, script.indexOf('\n  }\n', start));
};

describe('Stroop result screen', () => {
  it('blanking a word removes its text and ink', () => {
    expect(fn('blankWord')).toMatch(/wordEl\.textContent = '';\s+wordEl\.removeAttribute\('data-ink'\);\s+wordEl\.setAttribute\('data-blank', ''\);/);
  });

  it('the finished run blanks the last word before the result renders', () => {
    expect(fn('finishMainTest')).toMatch(/mode = 'done';[\s\S]*blankWord\(\);[\s\S]*renderResults\(scores\);/);
  });

  it('the run ends only through finishMainTest', () => {
    expect(script.match(/renderResults\(/g)).toHaveLength(2); // the call and the definition
    expect(fn('runNextTrial')).toMatch(/else if \(mode === 'main'\) \{\s+finishMainTest\(\);/);
  });

  it('focus still lands on the result headline', () => {
    expect(fn('renderResults')).toContain('headline.focus({ preventScroll: true });');
  });
});
