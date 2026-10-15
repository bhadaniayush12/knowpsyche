import { describe, expect, it } from 'vitest';
import { areas, order, resultUi, statements, strongestLine, type AreaId } from '../../data/tests/emotional-intelligence';
import {
  getBand,
  getResult,
  isHigh,
  itemScore,
  overallScore,
  sameAnswers,
  scoreAreas,
  strongestAreas,
  STATEMENT_COUNT,
} from './emotional-intelligence';

/** 28 answers in doc order, all `fill`, with overrides by doc number. */
const answersWith = (fill: number, overrides: Record<number, number> = {}) =>
  statements.map((s) => overrides[s.n] ?? fill);

/** Doc numbers of one area's statements, split by reverse scoring. */
const itemsOf = (area: AreaId, reverse: boolean) => statements.filter((s) => s.area === area && s.reverse === reverse).map((s) => s.n);

describe('EQ: statements and order', () => {
  it('has 28 statements, 7 per area, numbered 1–28', () => {
    expect(STATEMENT_COUNT).toBe(28);
    expect(statements.map((s) => s.n)).toEqual(Array.from({ length: 28 }, (_, i) => i + 1));
    for (const a of areas) expect(statements.filter((s) => s.area === a.id)).toHaveLength(7);
  });

  it('reverse-scores exactly items 4, 7, 10, 13, 18, 21, 25 and 28', () => {
    expect(statements.filter((s) => s.reverse).map((s) => s.n)).toEqual([4, 7, 10, 13, 18, 21, 25, 28]);
  });

  it('shows every statement once, in a fixed order with no two neighbours from the same area', () => {
    expect([...order].sort((a, b) => a - b)).toEqual(Array.from({ length: 28 }, (_, i) => i + 1));
    const areaOf = (n: number) => statements[n - 1].area;
    for (let i = 1; i < order.length; i++) expect(areaOf(order[i])).not.toBe(areaOf(order[i - 1]));
  });
});

describe('EQ: reverse items', () => {
  it('scores reverse items as 6 − answer and leaves the rest alone', () => {
    expect([1, 2, 3, 4, 5].map((a) => itemScore(a, true))).toEqual([5, 4, 3, 2, 1]);
    expect([1, 2, 3, 4, 5].map((a) => itemScore(a, false))).toEqual([1, 2, 3, 4, 5]);
  });

  it('a 5 on a reverse item lowers its area, a 5 on a normal item raises it', () => {
    const base = scoreAreas(answersWith(3)).knowing;
    expect(scoreAreas(answersWith(3, { 4: 5 })).knowing).toBeLessThan(base);
    expect(scoreAreas(answersWith(3, { 1: 5 })).knowing).toBeGreaterThan(base);
  });
});

describe('EQ: area and overall maths', () => {
  it('area score = (sum − 7) ÷ 28 × 100, rounded', () => {
    // Knowing: 5 + 4 + 3 + (6−2) + 5 + 4 + (6−1) = 30 → 23 ÷ 28 × 100 = 82.1 → 82. Others all 3s → 50.
    const scores = scoreAreas(answersWith(3, { 1: 5, 2: 4, 3: 3, 4: 2, 5: 5, 6: 4, 7: 1 }));
    expect(scores).toEqual({ knowing: 82, managing: 50, reading: 50, relationships: 50 });
  });

  it('covers 0 and 100 at the extremes', () => {
    const best = Object.fromEntries(statements.map((s) => [s.n, s.reverse ? 1 : 5]));
    const worst = Object.fromEntries(statements.map((s) => [s.n, s.reverse ? 5 : 1]));
    expect(Object.values(scoreAreas(answersWith(3, best)))).toEqual([100, 100, 100, 100]);
    expect(Object.values(scoreAreas(answersWith(3, worst)))).toEqual([0, 0, 0, 0]);
  });

  it('overall = average of the 4 area scores, rounded', () => {
    expect(overallScore({ knowing: 82, managing: 50, reading: 50, relationships: 50 })).toBe(58); // 58
    expect(overallScore({ knowing: 50, managing: 50, reading: 50, relationships: 52 })).toBe(51); // 50.5
    expect(overallScore({ knowing: 50, managing: 50, reading: 51, relationships: 50 })).toBe(50); // 50.25
    expect(getResult(answersWith(3, { 1: 5, 2: 4, 3: 3, 4: 2, 5: 5, 6: 4, 7: 1 })).overall).toBe(58);
  });

  it('rejects the wrong number of answers or values outside 1–5', () => {
    expect(() => scoreAreas(answersWith(3).slice(1))).toThrow();
    expect(() => scoreAreas(answersWith(3, { 5: 0 }))).toThrow();
    expect(() => scoreAreas(answersWith(3, { 5: 6 }))).toThrow();
    expect(() => scoreAreas(answersWith(3, { 5: 2.5 }))).toThrow();
  });
});

describe('EQ: strongest area and ties', () => {
  it('picks the single top area', () => {
    const res = getResult(answersWith(3, { 15: 5 }));
    expect(res.strongest.map((a) => a.id)).toEqual(['reading']);
    expect(strongestLine(res.strongest.map((a) => a.name))).toBe('Your strongest area: Reading other people.');
    expect(resultUi.shareStrongest(res.strongest.map((a) => a.name))).toBe('Strongest: Reading other people');
  });

  it('shows both areas when two tie', () => {
    const up = Object.fromEntries([...itemsOf('knowing', false), ...itemsOf('reading', false)].map((n) => [n, 5]));
    const res = getResult(answersWith(3, up));
    expect(res.areas.map((a) => a.score)).toEqual([86, 50, 86, 50]);
    expect(res.strongest.map((a) => a.id)).toEqual(['knowing', 'reading']);
    expect(strongestLine(res.strongest.map((a) => a.name))).toBe(
      'Your strongest areas: Knowing your feelings and Reading other people.',
    );
    expect(resultUi.shareStrongest(res.strongest.map((a) => a.name))).toBe('Two areas tied for strongest');
  });

  it('says the areas came out even when all four tie', () => {
    const scores = { knowing: 60, managing: 60, reading: 60, relationships: 60 };
    expect(strongestAreas(scores)).toHaveLength(4);
    const names = areas.map((a) => a.name);
    expect(strongestLine(names)).toBe('Your four areas came out even.');
    expect(resultUi.shareStrongest(names)).toBe('Your four areas came out even.');
    expect(resultUi.shareText(50, names)).not.toContain('Strongest');
  });

  it('still lists three areas when three tie', () => {
    const names = areas.slice(0, 3).map((a) => a.name);
    expect(strongestLine(names)).toBe(
      'Your strongest areas: Knowing your feelings, Managing your feelings and Reading other people.',
    );
    expect(resultUi.shareStrongest(names)).toBe('Three areas tied for strongest');
  });
});

describe('EQ: all-same answers', () => {
  it.each([
    [1, 29], // 5 × 1 + 2 × 5 = 15 → 8 ÷ 28 = 28.6
    [3, 50], // 21 → 14 ÷ 28
    [5, 71], // 5 × 5 + 2 × 1 = 27 → 20 ÷ 28 = 71.4
  ])('all %is: every area %i, the same-answer note shows, all four areas tie', (value, score) => {
    const res = getResult(answersWith(value));
    expect(res.areas.map((a) => a.score)).toEqual([score, score, score, score]);
    expect(res.overall).toBe(score);
    expect(res.sameAnswers).toBe(true);
    expect(res.strongest).toHaveLength(4);
  });

  it('no note when even one answer differs', () => {
    expect(sameAnswers(answersWith(3, { 28: 4 }))).toBe(false);
    expect(getResult(answersWith(5, { 1: 4 })).sameAnswers).toBe(false);
  });
});

describe('EQ: bands', () => {
  it('maps scores to bands at the edges (each band starts at its lower number)', () => {
    const badge = (s: number) => getBand(s).badge;
    expect([0, 49].map(badge)).toEqual(['Growing', 'Growing']);
    expect([50, 69].map(badge)).toEqual(['Solid', 'Solid']);
    expect([70, 84].map(badge)).toEqual(['Strong', 'Strong']);
    expect([85, 100].map(badge)).toEqual(['Very strong', 'Very strong']);
  });

  it('uses the "High" line from 50 and the "Lower" line under 50', () => {
    expect(isHigh(49)).toBe(false);
    expect(isHigh(50)).toBe(true);
    const res = getResult(answersWith(1));
    expect(res.areas.every((a) => !a.high && a.band.badge === 'Growing')).toBe(true);
  });
});
