import { statements, type TypeNumber } from '../../data/tests/enneagram';

export const TYPE_NUMBERS: TypeNumber[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
export const STATEMENT_COUNT = statements.length;

/** Two types within this many points of the top score count as a tie (part-1.md scoring rule 2). */
export const TIE_POINTS = 1;

export type Sums = Record<TypeNumber, number>;

/** Sum of each type's 5 answers (5–25). `answers[i]` is the 1–5 rating for statement i. */
export function scoreTypes(answers: readonly number[]): Sums {
  if (answers.length !== STATEMENT_COUNT) {
    throw new Error(`Expected ${STATEMENT_COUNT} answers, got ${answers.length}`);
  }
  const sums = Object.fromEntries(TYPE_NUMBERS.map((n) => [n, 0])) as Sums;
  answers.forEach((a, i) => {
    if (!Number.isInteger(a) || a < 1 || a > 5) throw new Error(`Answer ${i + 1} must be 1–5, got ${a}`);
    sums[statements[i].type] += a;
  });
  return sums;
}

/** Type score as a percentage: (sum − 5) ÷ 20 × 100, rounded. */
export function percent(sum: number): number {
  return Math.round(((sum - 5) / 20) * 100);
}

/** The two types next to `n` on the circle. Type 1's are 9 and 2; Type 9's are 8 and 1. */
export function neighbours(n: TypeNumber): [TypeNumber, TypeNumber] {
  const before = (n === 1 ? 9 : n - 1) as TypeNumber;
  const after = (n === 9 ? 1 : n + 1) as TypeNumber;
  return [before, after];
}

/** The higher-scoring neighbour. Both, in circle order, when they tie. */
export function wingsFor(n: TypeNumber, sums: Sums): TypeNumber[] {
  const [a, b] = neighbours(n);
  if (sums[a] === sums[b]) return [a, b];
  return [sums[a] > sums[b] ? a : b];
}

/** "4w5", or "4w3 or 4w5" when the wings tie. */
export function wingLabel(n: TypeNumber, wings: readonly TypeNumber[]): string {
  return wings.map((w) => `${n}w${w}`).join(' or ');
}

export interface Ranked {
  type: TypeNumber;
  sum: number;
  pct: number;
}

/** All 9 types, highest score first. Equal scores keep type order (1 before 2). */
export function rank(sums: Sums): Ranked[] {
  return TYPE_NUMBERS.map((type) => ({ type, sum: sums[type], pct: percent(sums[type]) })).sort(
    (x, y) => y.sum - x.sum || x.type - y.type,
  );
}

export interface EnneagramResult {
  /** `clear` = one main type; `tie` = two within 1 point; `even` = three or more within 1 point. */
  kind: 'clear' | 'tie' | 'even';
  /** The types within 1 point of the top, highest first. */
  top: TypeNumber[];
  ranked: Ranked[];
  /** Wing(s) for each type in `top`. */
  wings: Partial<Record<TypeNumber, TypeNumber[]>>;
  /** Set once the tie-break round has been applied. */
  tieBreak?: TieBreak;
}

export function getResult(answers: readonly number[]): EnneagramResult {
  const sums = scoreTypes(answers);
  const ranked = rank(sums);
  const max = ranked[0].sum;
  const top = ranked.filter((r) => r.sum >= max - TIE_POINTS).map((r) => r.type);
  const kind = top.length === 1 ? 'clear' : top.length === 2 ? 'tie' : 'even';
  const wings: EnneagramResult['wings'] = {};
  for (const n of top) wings[n] = wingsFor(n, sums);
  return { kind, top, ranked, wings };
}

// ---------- Bar chart roles ----------

export type BarRole = 'main' | 'wing' | 'none';

/**
 * How each type's bar is marked on the result: `main` (blue + "Main" tag), `wing` (violet + "Wing" tag) or `none` (neutral).
 * Even scores mark nothing, to match "No single type stood out". A type that is both a main type and a wing shows as main.
 */
export function barRoles(res: EnneagramResult): Record<TypeNumber, BarRole> {
  const roles = Object.fromEntries(TYPE_NUMBERS.map((t) => [t, 'none'])) as Record<TypeNumber, BarRole>;
  if (res.kind === 'even') return roles;
  for (const n of res.top) for (const w of res.wings[n] ?? []) roles[w] = 'wing';
  for (const n of res.top) roles[n] = 'main';
  return roles;
}

// ---------- Strength of the result ----------

/** A lead of this many points or more is a "clear lead". One answer can move a type by up to 4. */
export const CLEAR_LEAD_POINTS = 4;

export interface Strength {
  label: 'clear' | 'close' | 'settled';
  /** Points between the top type and the next. */
  gap: number;
  /** The runner-up type. */
  next: TypeNumber;
}

/** How far ahead the main type is. Only for a single main type (`clear`, or a tie settled by the tie-break). */
export function resultStrength(res: EnneagramResult): Strength {
  const [first, second] = res.ranked;
  if (res.tieBreak?.decided) {
    // Runner-up = the finalist with the most tie-break points after the winner.
    const tb = res.tieBreak;
    const sumOf = (t: TypeNumber) => res.ranked.find((r) => r.type === t)!.sum;
    const next = tb.finalists
      .filter((t) => t !== res.top[0])
      .sort((x, y) => (tb.scores[y] ?? 0) - (tb.scores[x] ?? 0) || sumOf(y) - sumOf(x) || x - y)[0];
    return { label: 'settled', gap: Math.abs(sumOf(res.top[0]) - sumOf(next)), next };
  }
  const gap = first.sum - second.sum;
  return { label: gap >= CLEAR_LEAD_POINTS ? 'clear' : 'close', gap, next: second.type };
}

// ---------- Why this type? ----------

/** Indexes of the statements for `type` the person rated highest (4 or 5 first), up to `n`, in the order shown. */
export function topStatements(answers: readonly number[], type: TypeNumber, n = 3): number[] {
  return statements
    .map((s, i) => ({ i, type: s.type, a: answers[i] }))
    .filter((x) => x.type === type)
    .sort((x, y) => y.a - x.a || x.i - y.i)
    .slice(0, n)
    .filter((x, k) => k === 0 || x.a >= 3)
    .map((x) => x.i);
}

// ---------- Tie-break round ----------

export type Motive = 'desire' | 'fear' | 'stress';
export type Choice = 'a' | 'b' | 'same';

export interface TieBreakQuestion {
  a: TypeNumber;
  b: TypeNumber;
  motive: Motive;
}

export interface TieBreak {
  finalists: TypeNumber[];
  /** Points from the round: 1 per choice, ½ each for "About the same". */
  scores: Partial<Record<TypeNumber, number>>;
  /** True when one finalist came out ahead. */
  decided: boolean;
}

/** Only run when 2 or 3 types are within a point. With 4 or more, the picture really is even. */
export function needsTieBreak(res: EnneagramResult): boolean {
  return res.top.length === 2 || res.top.length === 3;
}

const MOTIVES: Motive[] = ['desire', 'fear', 'stress'];

/** Every pair of finalists, once per motive: 3 questions for two types, 9 for three. */
export function tieBreakQuestions(finalists: readonly TypeNumber[]): TieBreakQuestion[] {
  const pairs: [TypeNumber, TypeNumber][] = [];
  for (let i = 0; i < finalists.length; i++) for (let j = i + 1; j < finalists.length; j++) pairs.push([finalists[i], finalists[j]]);
  // Motive by motive, so the same pair never comes up twice in a row when there are three types.
  return MOTIVES.flatMap((motive, m) => pairs.map(([a, b], k) => ((k + m) % 2 ? { a: b, b: a, motive } : { a, b, motive })));
}

/**
 * Applies the tie-break choices. The finalist with the most points becomes the main type.
 * Equal points stay tied (two types → `tie`, three → `even`, or a two-way tie if one finalist dropped out).
 * Original scores and the bar chart are never changed.
 */
export function applyTieBreak(res: EnneagramResult, choices: readonly Choice[]): EnneagramResult {
  const finalists = [...res.top];
  const qs = tieBreakQuestions(finalists);
  if (choices.length !== qs.length) throw new Error(`Expected ${qs.length} choices, got ${choices.length}`);
  const scores = Object.fromEntries(finalists.map((t) => [t, 0])) as Record<TypeNumber, number>;
  qs.forEach((q, i) => {
    const c = choices[i];
    if (c === 'a') scores[q.a] += 1;
    else if (c === 'b') scores[q.b] += 1;
    else {
      scores[q.a] += 0.5;
      scores[q.b] += 0.5;
    }
  });
  const sumOf = (t: TypeNumber) => res.ranked.find((r) => r.type === t)!.sum;
  const order = finalists.sort((x, y) => scores[y] - scores[x] || sumOf(y) - sumOf(x) || x - y);
  const best = scores[order[0]];
  const leaders = order.filter((t) => scores[t] === best);
  const decided = leaders.length === 1;
  const top = decided ? [order[0]] : leaders;
  const kind: EnneagramResult['kind'] = top.length === 1 ? 'clear' : top.length === 2 ? 'tie' : 'even';
  return { ...res, kind, top, tieBreak: { finalists: [...res.top], scores, decided } };
}
