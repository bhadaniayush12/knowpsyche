// The strip's inline pre-paint script (ProgressTrail.astro) must set the bottom row exactly as trailState() and
// the page script do, so nothing changes after the first paint. Runs the real script over every combination.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { TRAIL_ORDER, testHref, trailCopy, trailState } from '../progress-trail';

const source = readFileSync(new URL('../../components/result/ProgressTrail.astro', import.meta.url), 'utf8');
const body = /<script is:inline define:vars=\{\{[^}]*\}\}>([\s\S]*?)<\/script>/.exec(source)![1];
// define:vars gives the script `nextTpl`; currentScript.previousElementSibling is the strip.
const run = new Function('document', 'nextTpl', body);

class El {
  hidden = false;
  textContent = '';
  constructor(public attrs: Record<string, string> = {}) {}
  getAttribute(k: string) { return this.attrs[k] ?? null; }
  setAttribute(k: string, v: string) { this.attrs[k] = v; }
}

function strip(saved: string[], current: string) {
  const links = TRAIL_ORDER.map((id) => new El({ href: testHref(id), 'data-id': id, 'data-name': `Name ${id}` }));
  const next = new El({ href: testHref(TRAIL_ORDER[0]) });
  const done = new El();
  const soFar = new El();
  done.hidden = true;
  const el = Object.assign(new El({ 'data-current': current }), {
    querySelectorAll: () => links,
    querySelector: (s: string) => ({ '[data-trail-next]': next, '[data-trail-done]': done, '[data-trail-sofar]': soFar })[s] ?? null,
  });
  const document = { documentElement: new El(saved.length ? { 'data-kp-report': saved.join(' ') } : {}), currentScript: { previousElementSibling: el } };
  run(document, trailCopy.next('%'));
  return { next, done, soFar };
}

// Every subset of the seven tests, on every test page.
const subsets = Array.from({ length: 1 << TRAIL_ORDER.length }, (_, m) => TRAIL_ORDER.filter((_, i) => m & (1 << i)));

describe('trail strip pre-paint script agrees with trailState', () => {
  for (const current of TRAIL_ORDER) {
    it(`on ${current}: all ${subsets.length} combinations`, () => {
      for (const saved of subsets) {
        const s = trailState(saved, current);
        const { next, done, soFar } = strip(saved, current);
        const why = `${current} with [${saved.join(',')}]`;
        expect(next.hidden, why).toBe(s.allDone || !s.next);
        if (s.next) {
          expect(next.attrs.href, why).toBe(testHref(s.next));
          expect(next.textContent, why).toBe(trailCopy.next(`Name ${s.next}`));
        }
        expect(done.hidden, why).toBe(!s.allDone);
        expect(soFar.hidden, why).toBe(s.count === 0 || s.allDone);
      }
    });
  }
});
