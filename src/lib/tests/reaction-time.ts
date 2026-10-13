import { reactionBands, type ReactionBand } from '../../data/tests/reaction-time';

/** Anything under this is a guess, not a reaction (CLAUDE.md test engine rules). */
export const GUESS_THRESHOLD_MS = 100;

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
