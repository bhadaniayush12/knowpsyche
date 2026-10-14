import { describe, expect, it } from 'vitest';
import { bandFor, enneagramTypes, fitSize, formatDay, nameParts } from '../report';
import { reactionBands } from '../../data/tests/reaction-time';
import { numberBands } from '../../data/tests/number-memory';
import { photoBands } from '../../data/tests/photographic-memory';
import { attentionBands } from '../../data/tests/attention-span';
import { stroopBands } from '../../data/tests/stroop';
import { bands as eqBands } from '../../data/tests/emotional-intelligence';
import { standout, tryThis } from '../../data/report';

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

describe('bandFor', () => {
  const bands = [{ min: 0, b: 'a' }, { min: 50, b: 'b' }, { min: 70, b: 'c' }];
  it('picks the band by its lower bound', () => {
    expect(bandFor(0, bands).b).toBe('a');
    expect(bandFor(49, bands).b).toBe('a');
    expect(bandFor(50, bands).b).toBe('b');
    expect(bandFor(100, bands).b).toBe('c');
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
  it('every band of every test has its own "What stood out" and "One thing to try" line', () => {
    const banded = {
      'reaction-time': reactionBands,
      'number-memory': numberBands,
      'photographic-memory': photoBands,
      'attention-span': attentionBands,
      stroop: stroopBands,
      'emotional-intelligence': eqBands,
    } as const;
    for (const [id, bands] of Object.entries(banded) as [keyof typeof banded, readonly { badge: string }[]][]) {
      const badges = bands.map((b) => b.badge).sort();
      expect(Object.keys(standout[id].byBand ?? {}).sort()).toEqual(badges);
      expect(Object.keys(tryThis[id].byBand ?? {}).sort()).toEqual(badges);
    }
  });

  it('fallbacks exist only where a result can have no band', () => {
    expect(standout.enneagram.all).toBeTruthy();
    expect(standout.stroop.all).toBe("This run couldn't be measured, so there is no result to show for it.");
    expect(tryThis.stroop.all).toBe('Take the test again and save the new result.');
    for (const id of ['reaction-time', 'number-memory', 'photographic-memory', 'attention-span', 'emotional-intelligence'] as const) {
      expect(standout[id].all).toBeUndefined();
      expect(tryThis[id].all).toBeUndefined();
    }
  });

  it('never compares with other people or counts streaks', () => {
    const text = JSON.stringify(standout);
    expect(text).not.toMatch(/percent|better than|average person|most people|others|streak|\d+ points|earn points|top \d/i);
  });
});

describe('report copy wording (Q1-08)', () => {
  const all = JSON.stringify({ standout, tryThis });
  it.each(['points to a problem', 'which is normal', 'Totally normal', /\bnormal\b/i])('never says %s', (phrase) => {
    if (typeof phrase === 'string') expect(all).not.toContain(phrase);
    else expect(all).not.toMatch(phrase);
  });
  it('the replacement lines read as whole sentences', () => {
    expect(standout['reaction-time'].byBand!.Steady).toBe('A steady average. This is a snapshot of one moment, nothing more. Screens add some delay.');
    expect(standout['emotional-intelligence'].byBand!.Growing).toBe('Some areas are still developing. The skills behind this can be practised.');
  });
});
