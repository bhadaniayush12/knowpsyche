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
