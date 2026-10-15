import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Q4-A2: the tie-break round takes focus on its container, never on an answer, so a stray Enter answers nothing.
// The browser run (keyboard-only, Chromium + WebKit) checks the behaviour; these pin the wiring in the page source.

const root = fileURLToPath(new URL('../../../', import.meta.url));
const page = readFileSync(join(root, 'src/pages/enneagram-test/index.astro'), 'utf8');
const script = page.slice(page.indexOf('<script>'));

describe('Enneagram tie-break focus', () => {
  it('the tie-break container can take focus from script only', () => {
    expect(page).toMatch(/<div class="en-tb" tabindex="-1" hidden>/);
  });

  it('focuses the container without scrolling', () => {
    expect(script).toContain('const focusTieBreak = () => tb.focus({ preventScroll: true });');
  });

  it('moves focus when the round appears and after each choice', () => {
    const after = script.slice(script.indexOf('const afterStatements'), script.indexOf('const chooseTieBreak'));
    expect(after).toMatch(/phase = 'tiebreak';\s+render\(true\);\s+focusTieBreak\(\);/);
    const choice = script.slice(script.indexOf('const chooseTieBreak'), script.indexOf('const goBack'));
    expect(choice).toMatch(/tbIndex \+= 1;\s+render\(true\);\s+focusTieBreak\(\);/);
  });

  it('never focuses an answer button during the round', () => {
    const round = script.slice(script.indexOf('const afterStatements'), script.indexOf('const goBack'));
    expect(round).not.toMatch(/tbButtons\[\d\]\.focus|answerButtons\[\d\]\.focus/);
  });

  it('keys 1-3 still answer while focus is inside the card', () => {
    expect(script).toContain("if (!cardVisible() && !card.contains(document.activeElement)) return;");
    expect(script).toContain("chooseTieBreak((['a', 'b', 'same'] as const)[v - 1]);");
  });
});
