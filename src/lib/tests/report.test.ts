import { describe, expect, it } from 'vitest';
import { bandFor, enneagramTypes, fitSize, formatDay, highestOf, lowestOf, nameParts } from '../report';
import { standout, tryThis } from '../../data/report';
import { TEST_IDS } from '../saved-results';

describe('nameParts', () => {
  it('no name: "Your report"', () => {
    expect(nameParts('')).toEqual({ lead: 'Your ', accent: 'report', named: false });
    expect(nameParts('   ')).toMatchObject({ named: false });
    expect(nameParts(null)).toMatchObject({ named: false });
  });
  it('last word goes in the accent, like the site H1s', () => {
    expect(nameParts('Ayush  Bhadani ')).toEqual({ lead: 'Ayush ', accent: 'Bhadani', named: true });
    expect(nameParts('Maria de la Cruz')).toEqual({ lead: 'Maria de la ', accent: 'Cruz', named: true });
  });
  it('one word stays in the heavy sans', () => {
    expect(nameParts('Sam')).toEqual({ lead: 'Sam', accent: '', named: true });
  });
});

describe('formatDay', () => {
  it('formats an ISO day', () => {
    expect(formatDay('2026-10-14')).toBe('14 October 2026');
    expect(formatDay('2026-01-01')).toBe('1 January 2026');
  });
  it('leaves anything else alone', () => {
    expect(formatDay('')).toBe('');
    expect(formatDay('2026-13-01')).toBe('2026-13-01');
    expect(formatDay('yesterday')).toBe('yesterday');
  });
});

describe('enneagramTypes', () => {
  const scores = { '1': 10, '2': 12, '3': 9, '4': 22, '5': 18, '6': 8, '7': 11, '8': 7, '9': 13 };
  it('reads the badge the result showed', () => {
    expect(enneagramTypes('4w5', scores)).toEqual({ kind: 'clear', types: [4] });
    expect(enneagramTypes('Type 9', scores)).toEqual({ kind: 'clear', types: [9] });
    expect(enneagramTypes('4 or 9', scores)).toEqual({ kind: 'tie', types: [4, 9] });
    expect(enneagramTypes('Even', scores)).toEqual({ kind: 'even', types: [] });
  });
  it('falls back to the top score, or even when nothing is known', () => {
    expect(enneagramTypes('', scores)).toEqual({ kind: 'clear', types: [4] });
    expect(enneagramTypes('', null)).toEqual({ kind: 'even', types: [] });
  });
});

describe('bandFor / lowestOf / highestOf', () => {
  const bands = [{ min: 0, b: 'a' }, { min: 50, b: 'b' }, { min: 70, b: 'c' }];
  it('picks the band by its lower bound', () => {
    expect(bandFor(0, bands).b).toBe('a');
    expect(bandFor(49, bands).b).toBe('a');
    expect(bandFor(50, bands).b).toBe('b');
    expect(bandFor(100, bands).b).toBe('c');
  });
  it('ties go to the first in order', () => {
    const s = { knowing: 60, managing: 40, reading: 40, relationships: 80 };
    const order = ['knowing', 'managing', 'reading', 'relationships'];
    expect(lowestOf(s, order)).toBe('managing');
    expect(highestOf(s, order)).toBe('relationships');
    expect(lowestOf({}, order)).toBeNull();
  });
});

describe('fitSize', () => {
  it('returns the biggest size that fits', () => {
    // Pretend text fits on 2 lines from 10 down.
    expect(fitSize((s) => ({ lines: s > 10 ? 3 : 2, overflow: false }), { max: 15, min: 5 })).toEqual({ size: 10, fits: true });
  });
  it('a word wider than the box forces a smaller size', () => {
    expect(fitSize((s) => ({ lines: 1, overflow: s > 7.5 }), { max: 15, min: 5 })).toEqual({ size: 7.5, fits: true });
  });
  it('gives the minimum and fits:false when nothing fits', () => {
    expect(fitSize(() => ({ lines: 4, overflow: true }), { max: 15, min: 5 })).toEqual({ size: 5, fits: false });
  });
  it('max size when it already fits', () => {
    expect(fitSize(() => ({ lines: 1, overflow: false }), { max: 15, min: 5 })).toEqual({ size: 15, fits: true });
  });
});

describe('report copy', () => {
  it('has a placeholder and a slot for every test', () => {
    for (const id of TEST_IDS) {
      expect(standout[id].all.length).toBeGreaterThan(10);
      expect(tryThis[id]).toBeDefined();
    }
  });
  it('never compares with other people or counts streaks', () => {
    const text = JSON.stringify(standout);
    expect(text).not.toMatch(/percent|better than|average person|most people|others|streak|points|top \d/i);
  });
});
