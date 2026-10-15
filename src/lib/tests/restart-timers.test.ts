import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Q6-1: Restart must stop anything the old run left pending. The browser run (answer, Restart within 100 ms,
// then a full run, in Chromium + WebKit) checks the behaviour; these pin the wiring in the page source.

const root = fileURLToPath(new URL('../../../', import.meta.url));
const script = (slug: string) => {
  const page = readFileSync(join(root, `src/pages/${slug}/index.astro`), 'utf8');
  return page.slice(page.indexOf('<script>'));
};

describe.each(['enneagram-test', 'emotional-intelligence-test'])('%s: the answer pulse timer (Q6-1)', (slug) => {
  const s = script(slug);

  it('has one timer, and its id is kept', () => {
    expect(s.match(/setTimeout\(/g)).toHaveLength(1);
    expect(s).toContain('pulseTimer = window.setTimeout(() => {');
  });

  it('reset() clears it before anything else', () => {
    expect(s).toMatch(/const reset = \(\) => \{\s+window\.clearTimeout\(pulseTimer\);/);
  });

  it('every way back to a fresh run goes through reset()', () => {
    // Restart, Start after a result and Try again: none of them sets answers or index itself.
    expect(s.match(/answers = Array\(TOTAL\)\.fill\(null\)/g)).toHaveLength(1); // in reset() only
    expect(s).toMatch(/restart'\)\.addEventListener\('click', \(\) => \{\s+reset\(\);/);
    expect(s).toMatch(/\[data-try-again\][\s\S]{0,80}reset\(\);/);
  });
});

describe('reaction time: the sound check (Q6-2)', () => {
  const s = script('reaction-time-test');
  const startTry = s.slice(s.indexOf('const startTry'), s.indexOf('const beginTry'));

  it('reset() bumps the start token first', () => {
    expect(s).toMatch(/const reset = \(\) => \{\s+startToken \+= 1;/);
  });

  it('a mode change goes through reset()', () => {
    expect(s).toMatch(/const setMode = \(m: ReactionMode\) => \{[^}]*reset\(\);\s+\};/);
  });

  it('a check only starts a try if no reset happened while it waited', () => {
    expect(startTry).toMatch(/const token = startToken;\s+void soundRunning\(\)\.then/);
    expect(startTry).toContain('if (token !== startToken || ');
    expect(startTry.indexOf('token !== startToken')).toBeLessThan(startTry.indexOf('beginTry()', startTry.indexOf('.then')));
  });
});
