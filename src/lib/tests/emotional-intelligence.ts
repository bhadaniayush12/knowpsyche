import { areas, bands, statements, type Area, type AreaId, type EqBand } from '../../data/tests/emotional-intelligence';

export const STATEMENT_COUNT = statements.length;
/** "High" line from Solid up; "Lower" line for Growing. */
export const HIGH_FROM = 50;

/** One item's score. Reverse items (4, 7, 10, 13, 18, 21, 25, 28): 6 − answer. */
export function itemScore(answer: number, reverse: boolean): number {
  return reverse ? 6 - answer : answer;
}

/**
 * Area score = (sum of its 7 items − 7) ÷ 28 × 100, rounded (0–100).
 * `answers[i]` is the 1–5 rating for doc statement i + 1 (doc order, not screen order).
 */
export function scoreAreas(answers: readonly number[]): Record<AreaId, number> {
  if (answers.length !== STATEMENT_COUNT) {
    throw new Error(`Expected ${STATEMENT_COUNT} answers, got ${answers.length}`);
  }
  const sums = Object.fromEntries(areas.map((a) => [a.id, 0])) as Record<AreaId, number>;
  answers.forEach((a, i) => {
    if (!Number.isInteger(a) || a < 1 || a > 5) throw new Error(`Answer ${i + 1} must be 1–5, got ${a}`);
    const s = statements[i];
    sums[s.area] += itemScore(a, s.reverse);
  });
  return Object.fromEntries(areas.map((a) => [a.id, Math.round(((sums[a.id] - 7) / 28) * 100)])) as Record<AreaId, number>;
}

/** Overall score = average of the 4 area scores, rounded. */
export function overallScore(scores: Record<AreaId, number>): number {
  const values = areas.map((a) => scores[a.id]);
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

/** Under 50 Growing, 50–69 Solid, 70–84 Strong, 85+ Very strong. */
export function getBand(score: number): EqBand {
  return [...bands].reverse().find((b) => score >= b.min) ?? bands[0];
}

export function isHigh(score: number): boolean {
  return score >= HIGH_FROM;
}

/** Every area at the top score, in area order. More than one means a tie. */
export function strongestAreas(scores: Record<AreaId, number>): Area[] {
  const max = Math.max(...areas.map((a) => scores[a.id]));
  return areas.filter((a) => scores[a.id] === max);
}

/** True when every statement got the same answer (all 1s, all 3s, all 5s…). */
export function sameAnswers(answers: readonly number[]): boolean {
  return answers.length > 0 && answers.every((a) => a === answers[0]);
}

export interface AreaResult {
  area: Area;
  score: number;
  band: EqBand;
  high: boolean;
}

export interface EqResult {
  areas: AreaResult[];
  overall: number;
  overallBand: EqBand;
  strongest: Area[];
  sameAnswers: boolean;
}

/** `answers` in doc order (index 0 = statement 1). */
export function getResult(answers: readonly number[]): EqResult {
  const scores = scoreAreas(answers);
  const overall = overallScore(scores);
  return {
    areas: areas.map((area) => ({ area, score: scores[area.id], band: getBand(scores[area.id]), high: isHigh(scores[area.id]) })),
    overall,
    overallBand: getBand(overall),
    strongest: strongestAreas(scores),
    sameAnswers: sameAnswers(answers),
  };
}

/** Marker position on the 0–100 band scale. */
export function scalePercent(score: number): number {
  return Math.max(2, Math.min(98, score));
}
