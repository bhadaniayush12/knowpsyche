import { describe, expect, it } from 'vitest';
import { statements, tieBreakLines, types, wingLines, type TypeNumber } from '../../data/tests/enneagram';
import {
  applyTieBreak,
  barRoles,
  getResult,
  needsTieBreak,
  neighbours,
  percent,
  rank,
  resultStrength,
  scoreTypes,
  STATEMENT_COUNT,
  tieBreakQuestions,
  topStatements,
  wingLabel,
  wingsFor,
  type Choice,
  type Sums,
} from './enneagram';

/** Answers where each type's 5 statements all get the rating in `byType` (default 1). */
function answersFor(byType: Partial<Record<TypeNumber, number>>, fallback = 1): number[] {
  return statements.map((s) => byType[s.type] ?? fallback);
}

/** Answers giving exact type sums: spreads `sum` (5–25) over that type's 5 statements. */
function answersForSums(target: Partial<Record<TypeNumber, number>>, fallback = 5): number[] {
  const left: Record<number, number> = {};
  const seen: Record<number, number> = {};
  return statements.map((s) => {
    const sum = target[s.type] ?? fallback;
    left[s.type] ??= sum;
    seen[s.type] = (seen[s.type] ?? 0) + 1;
    const remaining = 5 - seen[s.type]; // statements still to fill for this type after this one
    const v = Math.min(5, Math.max(1, left[s.type] - remaining));
    left[s.type] -= v;
    return v;
  });
}

const sumsOf = (partial: Partial<Sums>, fallback = 15): Sums =>
  Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => [n, partial[n as TypeNumber] ?? fallback])) as Sums;

describe('content data', () => {
  it('has 45 statements, 5 per type, in the 1–9 order', () => {
    expect(STATEMENT_COUNT).toBe(45);
    statements.forEach((s, i) => expect(s.type).toBe((i % 9) + 1));
    expect(types.map((t) => t.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('has a wing line for every type and neighbour, and no others', () => {
    const expected = types.flatMap((t) => neighbours(t.n).map((w) => `${t.n}w${w}`)).sort();
    expect(Object.keys(wingLines).sort()).toEqual(expected);
  });

  it('the helper builds the exact sums asked for', () => {
    const sums = scoreTypes(answersForSums({ 1: 6, 2: 24, 3: 13 }));
    expect([sums[1], sums[2], sums[3], sums[4]]).toEqual([6, 24, 13, 5]);
  });
});

describe('scoreTypes', () => {
  it('sums each type', () => {
    const sums = scoreTypes(answersFor({ 4: 5, 5: 4 }, 2));
    expect(sums[4]).toBe(25);
    expect(sums[5]).toBe(20);
    expect(sums[1]).toBe(10);
  });

  it('rejects the wrong length or out-of-range answers', () => {
    expect(() => scoreTypes([1, 2, 3])).toThrow();
    expect(() => scoreTypes(answersFor({}, 0))).toThrow();
    expect(() => scoreTypes(answersFor({}, 6))).toThrow();
    expect(() => scoreTypes(answersFor({}, 2.5))).toThrow();
  });
});

describe('percent', () => {
  it('maps 5–25 to 0–100', () => {
    expect(percent(5)).toBe(0);
    expect(percent(15)).toBe(50);
    expect(percent(25)).toBe(100);
    expect(percent(6)).toBe(5);
    expect(percent(18)).toBe(65);
  });
});

describe('neighbours and wings', () => {
  it('wraps round the circle', () => {
    expect(neighbours(1)).toEqual([9, 2]);
    expect(neighbours(9)).toEqual([8, 1]);
    expect(neighbours(4)).toEqual([3, 5]);
  });

  it('picks the higher-scoring neighbour', () => {
    expect(wingsFor(4, sumsOf({ 3: 10, 5: 20 }))).toEqual([5]);
    expect(wingsFor(1, sumsOf({ 9: 22, 2: 8 }))).toEqual([9]);
    expect(wingsFor(9, sumsOf({ 8: 7, 1: 19 }))).toEqual([1]);
  });

  it('returns both wings on a wing tie', () => {
    expect(wingsFor(4, sumsOf({ 3: 18, 5: 18 }))).toEqual([3, 5]);
    expect(wingsFor(1, sumsOf({ 9: 12, 2: 12 }))).toEqual([9, 2]);
  });

  it('labels wings', () => {
    expect(wingLabel(4, [5])).toBe('4w5');
    expect(wingLabel(4, [3, 5])).toBe('4w3 or 4w5');
  });
});

describe('rank', () => {
  it('sorts highest first, type order on equal scores', () => {
    expect(rank(sumsOf({ 7: 20, 2: 20, 5: 25 }, 10)).map((r) => r.type)).toEqual([5, 2, 7, 1, 3, 4, 6, 8, 9]);
  });
});

describe('getResult', () => {
  it('clear winner', () => {
    const r = getResult(answersForSums({ 4: 24, 5: 19, 3: 12 }, 10));
    expect(r.kind).toBe('clear');
    expect(r.top).toEqual([4]);
    expect(r.wings[4]).toEqual([5]);
    expect(r.ranked[0]).toEqual({ type: 4, sum: 24, pct: 95 });
    expect(r.ranked).toHaveLength(9);
  });

  it('a 2-point gap is still a clear winner', () => {
    const r = getResult(answersForSums({ 4: 22, 9: 20 }, 10));
    expect(r.kind).toBe('clear');
    expect(r.top).toEqual([4]);
  });

  it('exact tie for the top type', () => {
    const r = getResult(answersForSums({ 4: 22, 9: 22 }, 10));
    expect(r.kind).toBe('tie');
    expect(r.top).toEqual([4, 9]);
  });

  it('a tie within 1 point lists the higher score first', () => {
    const r = getResult(answersForSums({ 4: 21, 9: 22 }, 10));
    expect(r.kind).toBe('tie');
    expect(r.top).toEqual([9, 4]);
    expect(r.wings[9]).toEqual([8, 1]); // 8 and 1 both 10
  });

  it('three types within 1 point → even', () => {
    const r = getResult(answersForSums({ 2: 20, 6: 20, 7: 19 }, 10));
    expect(r.kind).toBe('even');
    expect(r.top).toEqual([2, 6, 7]);
  });

  it('wing tie on a clear winner', () => {
    const r = getResult(answersForSums({ 4: 25, 3: 15, 5: 15 }, 10));
    expect(r.kind).toBe('clear');
    expect(r.wings[4]).toEqual([3, 5]);
  });

  it.each([
    [1, 0],
    [3, 50],
    [5, 100],
  ])('all answers %i → even, every score %i%%', (value, pct) => {
    const r = getResult(answersFor({}, value));
    expect(r.kind).toBe('even');
    expect(r.top).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(new Set(r.ranked.map((x) => x.pct))).toEqual(new Set([pct]));
    expect(r.wings[1]).toEqual([9, 2]);
  });
});

describe('barRoles (result bars: Main tag + blue, Wing tag + violet, or neutral)', () => {
  const marked = (r: ReturnType<typeof barRoles>) => Object.entries(r).filter(([, v]) => v !== 'none');

  it('clear winner: one main type and its wing, the rest neutral', () => {
    const roles = barRoles(getResult(answersForSums({ 4: 24, 5: 19, 3: 12 }, 10)));
    expect(marked(roles)).toEqual([['4', 'main'], ['5', 'wing']]);
  });

  it('two-way near tie (1 point apart): both types are main, each with its wing', () => {
    const r = getResult(answersForSums({ 4: 21, 9: 22, 5: 14, 1: 13 }, 10));
    expect(r.kind).toBe('tie');
    expect(marked(barRoles(r))).toEqual([['1', 'wing'], ['4', 'main'], ['5', 'wing'], ['9', 'main']]);
  });

  it('two-way tie where one finalist is the other one\'s wing: it shows as main', () => {
    const r = getResult(answersForSums({ 4: 22, 5: 22 }, 10));
    expect(barRoles(r)[4]).toBe('main');
    expect(barRoles(r)[5]).toBe('main');
  });

  it('fully even (all answers the same): nothing marked', () => {
    const r = getResult(answersFor({}, 3));
    expect(r.kind).toBe('even');
    expect(marked(barRoles(r))).toEqual([]);
  });

  it('three types within a point (even): nothing marked, though they have wings', () => {
    const r = getResult(answersForSums({ 2: 20, 6: 20, 7: 19 }, 10));
    expect(r.kind).toBe('even');
    expect(Object.keys(r.wings)).toHaveLength(3);
    expect(marked(barRoles(r))).toEqual([]);
  });

  it('three-way tie-break left undecided (even): nothing marked', () => {
    const r0 = getResult(answersForSums({ 2: 20, 6: 20, 7: 19 }, 10));
    const r = applyTieBreak(r0, Array(9).fill('same'));
    expect(r.kind).toBe('even');
    expect(marked(barRoles(r))).toEqual([]);
  });

  it('tie settled by the tie-break: only the winner is main', () => {
    const r0 = getResult(answersForSums({ 4: 22, 9: 22 }, 10));
    const r = applyTieBreak(r0, ['a', 'a', 'a'].map((_, i) => (tieBreakQuestions([4, 9])[i].a === 9 ? 'a' : 'b')) as Choice[]);
    expect(r.top).toEqual([9]);
    expect(Object.entries(barRoles(r)).filter(([, v]) => v === 'main')).toEqual([['9', 'main']]);
  });
});

describe('resultStrength', () => {
  it('a lead of 4+ points is a clear lead', () => {
    const s = resultStrength(getResult(answersForSums({ 4: 24, 5: 20 }, 10)));
    expect(s).toEqual({ label: 'clear', gap: 4, next: 5 });
  });

  it('a lead of 2–3 points is a close call', () => {
    expect(resultStrength(getResult(answersForSums({ 4: 22, 5: 20 }, 10)))).toEqual({ label: 'close', gap: 2, next: 5 });
    expect(resultStrength(getResult(answersForSums({ 4: 23, 5: 20 }, 10))).label).toBe('close');
  });

  it('a settled tie names the tie-break runner-up', () => {
    const tied = getResult(answersForSums({ 4: 22, 9: 21, 2: 21 }, 10)); // 4, 2, 9 within a point
    expect(tied.top).toEqual([4, 2, 9]);
    const qs = tieBreakQuestions(tied.top);
    // 9 wins everything, 2 beats 4 when 9 isn't in the pair
    const choices = qs.map((q): Choice => (q.a === 9 ? 'a' : q.b === 9 ? 'b' : q.a === 2 ? 'a' : 'b'));
    const s = resultStrength(applyTieBreak(tied, choices));
    expect(s.label).toBe('settled');
    expect(s.next).toBe(2);
    expect(s.gap).toBe(0);
  });
});

describe('topStatements', () => {
  it('returns the highest-rated statements for the type, in the order shown on ties', () => {
    const answers = answersFor({}, 2);
    const fours = statements.map((s, i) => (s.type === 4 ? i : -1)).filter((i) => i >= 0); // 3, 12, 21, 30, 39
    answers[fours[3]] = 5;
    answers[fours[1]] = 4;
    answers[fours[4]] = 4;
    expect(topStatements(answers, 4)).toEqual([fours[3], fours[1], fours[4]]);
  });

  it('drops weak extras (rated under 3) but always keeps the top one', () => {
    const answers = answersFor({}, 1);
    const firstFour = statements.findIndex((s) => s.type === 4);
    answers[firstFour] = 4;
    expect(topStatements(answers, 4)).toEqual([firstFour]);
  });
});

describe('tie-break round', () => {
  it('has a line for every type and motive', () => {
    for (const t of types) {
      const l = tieBreakLines[t.n];
      expect(l.desire && l.fear && l.stress).toBeTruthy();
    }
  });

  it('runs only for 2 or 3 near-tied types', () => {
    expect(needsTieBreak(getResult(answersForSums({ 4: 24 }, 10)))).toBe(false);
    expect(needsTieBreak(getResult(answersForSums({ 4: 22, 9: 22 }, 10)))).toBe(true);
    expect(needsTieBreak(getResult(answersForSums({ 2: 20, 6: 20, 7: 19 }, 10)))).toBe(true);
    expect(needsTieBreak(getResult(answersFor({}, 3)))).toBe(false); // all 9 even
  });

  it('asks 3 questions for two types and 9 for three, each pair once per motive', () => {
    expect(tieBreakQuestions([4, 9])).toHaveLength(3);
    const qs = tieBreakQuestions([2, 6, 7]);
    expect(qs).toHaveLength(9);
    for (const m of ['desire', 'fear', 'stress']) {
      const pairs = qs.filter((q) => q.motive === m).map((q) => [q.a, q.b].sort().join('-'));
      expect(pairs.sort()).toEqual(['2-6', '2-7', '6-7']);
    }
    // no pair twice in a row
    qs.slice(1).forEach((q, i) => expect([q.a, q.b].sort().join()).not.toBe([qs[i].a, qs[i].b].sort().join()));
  });

  it('settles a two-way tie', () => {
    const tied = getResult(answersForSums({ 4: 22, 9: 22 }, 10));
    const choices = tieBreakQuestions(tied.top).map((q): Choice => (q.a === 9 ? 'a' : 'b'));
    const r = applyTieBreak(tied, choices);
    expect(r.kind).toBe('clear');
    expect(r.top).toEqual([9]);
    expect(r.tieBreak).toEqual({ finalists: [4, 9], scores: { 4: 0, 9: 3 }, decided: true });
    expect(r.ranked).toEqual(tied.ranked); // scores and chart untouched
  });

  it('"About the same" every time leaves the tie in place', () => {
    const tied = getResult(answersForSums({ 4: 22, 9: 21 }, 10));
    const r = applyTieBreak(tied, ['same', 'same', 'same']);
    expect(r.kind).toBe('tie');
    expect(r.top).toEqual([4, 9]); // higher original score first
    expect(r.tieBreak?.decided).toBe(false);
  });

  it('three types: one drops out, two stay tied', () => {
    const even = getResult(answersForSums({ 2: 20, 6: 20, 7: 19 }, 10));
    // 7 loses every time; 2 v 6 always "same"
    const choices = tieBreakQuestions(even.top).map((q): Choice => (q.a === 7 ? 'b' : q.b === 7 ? 'a' : 'same'));
    const r = applyTieBreak(even, choices);
    expect(r.kind).toBe('tie');
    expect(r.top).toEqual([2, 6]);
  });

  it('three types all equal stay even', () => {
    const even = getResult(answersForSums({ 2: 20, 6: 20, 7: 20 }, 10));
    const r = applyTieBreak(even, Array(9).fill('same'));
    expect(r.kind).toBe('even');
    expect(r.top).toHaveLength(3);
  });

  it('rejects the wrong number of choices', () => {
    expect(() => applyTieBreak(getResult(answersForSums({ 4: 22, 9: 22 }, 10)), ['a'])).toThrow();
  });
});
