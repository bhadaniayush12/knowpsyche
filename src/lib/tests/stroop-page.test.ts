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

  // UX-2: a finished run must not look live. The four answer buttons are really disabled (no click, no
  // focus, no Enter) with aria-disabled, greyed in CSS, and back on with any restart.
  it('the finished run disables the answer buttons before the result takes focus', () => {
    expect(fn('setAnswersEnabled')).toMatch(/btn\.disabled = !on;/);
    expect(fn('setAnswersEnabled')).toContain("btn.setAttribute('aria-disabled', 'true')");
    expect(fn('setAnswersEnabled')).toContain("btn.removeAttribute('aria-disabled')");
    expect(fn('finishMainTest')).toMatch(/setAnswersEnabled\(false\);[\s\S]*renderResults\(scores\);/);
  });

  it('every restart turns the answer buttons back on', () => {
    expect(fn('restartAll')).toContain('setAnswersEnabled(true);');
    expect(script.match(/setAnswersEnabled\((true|false)\)/g)).toHaveLength(2);
  });

  it('disabled answer buttons are greyed with design tokens', () => {
    const rule = page.match(/\.st-btn:disabled \{([^}]*)\}/)?.[1] ?? '';
    expect(rule).toContain('var(--color-line-inner)');
    expect(rule).toContain('var(--color-muted)');
    expect(rule).toContain('cursor: default');
  });
});
