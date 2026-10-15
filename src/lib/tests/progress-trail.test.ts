import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { TRAIL_ORDER, testHref, trailCopy, trailState } from '../progress-trail';

describe('progress trail', () => {
  it('follows the linear next-test order', () => {
    expect(TRAIL_ORDER).toEqual(['reaction-time', 'enneagram', 'photographic-memory', 'number-memory', 'attention-span', 'stroop', 'emotional-intelligence']);
    expect(testHref('number-memory')).toBe('/number-memory-test/');
  });

  it('nothing saved: count 0, next is the one after the current test', () => {
    const s = trailState([], 'reaction-time');
    expect(s).toMatchObject({ count: 0, total: 7, next: 'enneagram', allDone: false });
    expect(s.saved).toEqual([false, false, false, false, false, false, false]);
  });

  it('3 of 7: next is the first unsaved test after the current one', () => {
    const s = trailState(['reaction-time', 'enneagram', 'photographic-memory'], 'photographic-memory');
    expect(s.count).toBe(3);
    expect(s.saved).toEqual([true, true, true, false, false, false, false]);
    expect(s.next).toBe('number-memory');
    expect(trailCopy.heading(s.count, s.total)).toBe('Your KnowPsyche report · 3 of 7 tried');
    expect(trailCopy.next('Number memory')).toBe('Next: Number memory');
  });

  it('skips saved tests and wraps round to the start', () => {
    expect(trailState(['emotional-intelligence', 'reaction-time'], 'stroop').next).toBe('enneagram');
  });

  it('never points at the current test, even when it is the only one left', () => {
    const others = ['reaction-time', 'enneagram', 'photographic-memory', 'number-memory', 'attention-span', 'emotional-intelligence'];
    expect(trailState(others, 'stroop')).toMatchObject({ count: 6, next: null, allDone: false });
  });

  it('all 7 saved: all done, no next', () => {
    const s = trailState(TRAIL_ORDER, 'enneagram');
    expect(s).toMatchObject({ count: 7, next: null, allDone: true });
    expect(trailCopy.allDone).toBe('All 7 tried. Your report is ready.');
  });

  it('ignores unknown ids and duplicates', () => {
    expect(trailState(['iq', 'stroop', 'stroop'], null)).toMatchObject({ count: 1, next: 'reaction-time' });
  });

  it('marker labels say saved or not', () => {
    expect(trailCopy.marker('Stroop test', true)).toBe('Stroop test: saved');
    expect(trailCopy.marker('Stroop test', false)).toBe('Stroop test: not saved yet');
  });

  it('the trail and its row of links have plain-English names, all four different (Q5)', () => {
    expect(trailCopy.labels).toEqual({
      strip: { region: 'Your test progress', nav: 'Jump to a test' },
      card: { region: 'Your report so far', nav: 'Choose a test to try next' },
    });
    const all = [trailCopy.labels.strip, trailCopy.labels.card].flatMap((l) => [l.region, l.nav]);
    expect(new Set(all).size).toBe(4);
    for (const l of all) expect(l).not.toMatch(/[—–]/);
  });

  it('the component uses them, not one shared aria-labelledby', () => {
    const src = readFileSync(fileURLToPath(new URL('../../components/result/ProgressTrail.astro', import.meta.url)), 'utf8');
    expect(src).toContain('<section\n  data-kp-trail');
    expect(src).toContain('  aria-label={trailCopy.labels[variant].region}\n');
    expect(src).toContain('<nav aria-label={trailCopy.labels[variant].nav}');
    expect(src).not.toContain('aria-labelledby');
  });
});
