import { describe, expect, it } from 'vitest';
import { boxCopy, fillBoxes, hasVisual, meaningFor } from '../report-view';
import { standout, tryThis } from '../../data/report';
import { result as enneagramCopy, types as enneagramTypes } from '../../data/tests/enneagram';
import { bands as eqBands, result as eqCopy } from '../../data/tests/emotional-intelligence';
import type { SavedTestResult, TestId } from '../saved-results';

const saved = (testId: TestId, badge: string, data: SavedTestResult['data'] = 7): SavedTestResult => ({ testId, date: '2026-10-14', badge, headline: `${badge} result`, data });

// Every line of Enneagram copy the two boxes could ever show.
const enneagramLines = [standout.enneagram.all!, enneagramCopy.evenTipReport, ...enneagramTypes.map((t) => t.tip)];

// A stand-in sheet: just the two boxes and their row.
const fakeSheet = () => {
  const parts: Record<string, { hidden: boolean; textContent: string }> = {
    '.rp-two': { hidden: false, textContent: '' },
    '[data-f="standout"]': { hidden: false, textContent: 'old' },
    '[data-f="try"]': { hidden: false, textContent: 'old' },
  };
  return { parts, sheet: { querySelector: (s: string) => parts[s] ?? null } as unknown as Pick<HTMLElement, 'querySelector'> };
};

describe('report boxes for a badge that is not a current band', () => {
  const unknown: [TestId, string, SavedTestResult['data']][] = [
    ['reaction-time', 'Turbo', 150],
    ['number-memory', 'Level 9', 9],
    ['number-memory', '', 7],
    ['photographic-memory', 'Turbo', 5],
    ['attention-span', '1', 50],
    ['stroop', '', null],
    ['emotional-intelligence', 'Turbo', { knowing: 50 }],
  ];

  it.each(unknown)('%s with badge %j: no copy at all', (id, badge, data) => {
    expect(boxCopy(saved(id, badge, data))).toBeNull();
  });

  it.each(unknown)('%s with badge %j: the row is hidden and nothing is left in the boxes', (id, badge, data) => {
    const { parts, sheet } = fakeSheet();
    fillBoxes(sheet, saved(id, badge, data));
    expect(parts['.rp-two'].hidden).toBe(true);
    expect(parts['[data-f="standout"]'].textContent).toBe('');
    expect(parts['[data-f="try"]'].textContent).toBe('');
    for (const line of enneagramLines) expect(JSON.stringify(parts)).not.toContain(line);
  });
});

describe('report boxes for a valid band', () => {
  it.each([
    ['reaction-time', 'Quick'],
    ['number-memory', 'Steady'],
    ['photographic-memory', 'Sharp'],
    ['attention-span', 'Laser'],
    ['stroop', 'Mild pull'],
    ['emotional-intelligence', 'Very strong'],
  ] as [TestId, string][])('%s %s shows its own copy', (id, badge) => {
    const { parts, sheet } = fakeSheet();
    fillBoxes(sheet, saved(id, badge, id === 'emotional-intelligence' ? { knowing: 90 } : 7));
    expect(parts['.rp-two'].hidden).toBe(false);
    expect(parts['[data-f="standout"]'].textContent).toBe(standout[id].byBand![badge]);
    expect(parts['[data-f="try"]'].textContent).toBe(tryThis[id].byBand![badge]);
    for (const line of enneagramLines) expect(JSON.stringify(parts)).not.toContain(line);
  });

  it('every band of every non-Enneagram test has both lines', () => {
    for (const id of ['reaction-time', 'number-memory', 'photographic-memory', 'attention-span', 'stroop', 'emotional-intelligence'] as TestId[]) {
      for (const badge of Object.keys(standout[id].byBand ?? {})) expect(boxCopy(saved(id, badge))).not.toBeNull();
    }
  });
});

describe('the Enneagram keeps its own copy', () => {
  const scores = { 1: 10, 2: 10, 3: 10, 4: 22, 5: 21, 6: 10, 7: 10, 8: 10, 9: 10 };
  it('a wing badge uses the main type tip', () => {
    expect(boxCopy(saved('enneagram', '4w5', scores))).toEqual({ standout: standout.enneagram.all, tip: enneagramTypes.find((t) => t.n === 4)!.tip });
  });
  it('a tie uses the first type tip', () => {
    expect(boxCopy(saved('enneagram', '4 or 9', scores))?.tip).toBe(enneagramTypes.find((t) => t.n === 4)!.tip);
  });
  it('"Even" uses the report\'s even tip, which points at no descriptions (the sheet has none) (Q2-10)', () => {
    const tip = boxCopy(saved('enneagram', 'Even', scores))?.tip;
    expect(tip).toBe(enneagramCopy.evenTipReport);
    expect(tip).not.toMatch(/description/i);
  });
});

describe('"What it means" on the EQ sheet (Q1-04)', () => {
  it.each(eqBands.map((b) => b.badge))('overall %s: no per-area band text, so the box has no lines and is hidden', (badge) => {
    const lines = meaningFor('emotional-intelligence', saved('emotional-intelligence', badge, { knowing: 50, managing: 50, reading: 50, relationships: 50 }));
    expect(lines).toEqual([]);
    for (const b of eqBands) expect(lines.join(' ')).not.toContain(b.text);
    expect(lines.join(' ')).not.toContain(eqCopy.closing);
  });
});

describe('"What it means" on the Stroop sheet (Q1-10)', () => {
  it('ends with the full "What can change your result" sentence from the Stroop page', () => {
    const lines = meaningFor('stroop', saved('stroop', 'Mild pull', 120));
    expect(lines.at(-1)).toBe('What can change your result: the trial responses you make in this session. The task requires distinguishing the ink colours, and the gap does not isolate a single cause.');
    expect(lines.at(-1)).toMatch(/\.$/);
  });
});

describe('the score visual (Q1-09)', () => {
  it('an unmeasured Stroop run has no visual: no big number, no chips', () => {
    expect(hasVisual(saved('stroop', '', null))).toBe(false);
  });
  it.each([
    ['stroop', 'Mild pull', 120],
    ['stroop', 'Unshakeable', -20],
    ['reaction-time', 'Quick', 220],
    ['number-memory', 'Steady', 7],
    ['emotional-intelligence', 'Solid', { knowing: 60, managing: 60, reading: 60, relationships: 60 }],
  ] as [TestId, string, SavedTestResult['data']][])('%s %s has a visual', (id, badge, data) => {
    expect(hasVisual(saved(id, badge, data))).toBe(true);
  });
});
