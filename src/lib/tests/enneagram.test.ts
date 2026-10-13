import { describe, expect, it } from 'vitest';
import { statements, types, wingLines, type TypeNumber } from '../../data/tests/enneagram';
import { getResult, neighbours, percent, rank, scoreTypes, STATEMENT_COUNT, wingLabel, wingsFor, type Sums } from './enneagram';

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
