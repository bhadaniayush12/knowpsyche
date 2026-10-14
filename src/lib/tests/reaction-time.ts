import { reactionBands, type ReactionBand, type ReactionMode } from '../../data/tests/reaction-time';

/** Anything under this is a guess, not a reaction (CLAUDE.md test engine rules). */
export const GUESS_THRESHOLD_MS = 100;

/** Valid tries needed for a result. */
export const TRIES = 5;

/** Spread above this gets the "bit inconsistent" challenge. */
export const SPREAD_CHALLENGE_MS = 60;

export function isGuess(ms: number): boolean {
  return ms < GUESS_THRESHOLD_MS;
}

/** Band for a time in ms. Times are rounded first, so 199.6 counts as 200. */
export function getBand(ms: number): ReactionBand {
  const rounded = Math.round(ms);
  return reactionBands.find((b) => rounded <= b.max) ?? reactionBands[reactionBands.length - 1];
}

/** Bar fill for the result visual, 4–100%, mapped over 100–500 ms. */
export function fillPercent(ms: number): number {
  return Math.max(4, Math.min(100, ((ms - 100) / 400) * 100));
}

/**
 * Adds a timed press to the list of valid tries. Guesses (under 100 ms) are not counted,
 * so the same try is repeated. Times are kept in whole ms.
 */
export function addTry(tries: readonly number[], ms: number): { tries: number[]; counted: boolean; done: boolean } {
  if (isGuess(ms) || tries.length >= TRIES) {
    return { tries: [...tries], counted: false, done: tries.length >= TRIES };
  }
  const next = [...tries, Math.round(ms)];
  return { tries: next, counted: true, done: next.length >= TRIES };
}

export interface Summary {
  /** Mean of the tries, rounded to the nearest ms. */
  average: number;
  fastest: number;
  slowest: number;
  /** Fastest to slowest, in ms. */
  spread: number;
}

export function summarize(tries: readonly number[]): Summary {
  if (tries.length === 0) throw new Error('summarize() needs at least one try');
  const fastest = Math.min(...tries);
  const slowest = Math.max(...tries);
  const average = Math.round(tries.reduce((a, b) => a + b, 0) / tries.length);
  return { average, fastest, slowest, spread: slowest - fastest };
}

export function isInconsistent(spread: number): boolean {
  return spread > SPREAD_CHALLENGE_MS;
}

/** "What does it mean?" — band text, then fastest try and spread (part-1.md result copy). */
export function meaningLine(s: Summary): string {
  const band = getBand(s.average).text.replace(/[.\s]+$/, '');
  return `${band}. Your fastest try was ${s.fastest} ms, and your tries were ${s.spread} ms apart.`;
}

/** Share text, e.g. "My reaction time: 247 ms, Quick. Can you beat it?" */
export function shareText(average: number): string {
  return `My reaction time: ${average} ms, ${getBand(average).badge}. Can you beat it?`;
}

/** Random wait before the signal: 1.5–4 s. `rand` returns [0, 1). */
export function waitMs(rand: () => number = Math.random): number {
  return 1500 + rand() * 2500;
}

/** F1 mode: random hold after the fifth light, 0.5–3 s. */
export function f1HoldMs(rand: () => number = Math.random): number {
  return 500 + rand() * 2500;
}

/** F1 mode: the five lights switch on one per second. Light i (0–4) comes on at i × 1000 ms. */
export const F1_LIGHT_GAP_MS = 1000;
export const F1_LIGHTS = 5;

/** How many F1 lights are on, `elapsed` ms after the sequence started (before lights out). */
export function f1LightsOn(elapsed: number): number {
  if (elapsed < 0) return 0;
  return Math.min(F1_LIGHTS, Math.floor(elapsed / F1_LIGHT_GAP_MS) + 1);
}

/** Time from start until lights out, for a given hold. */
export function f1Total(hold: number): number {
  return (F1_LIGHTS - 1) * F1_LIGHT_GAP_MS + hold;
}

export type { ReactionMode };
