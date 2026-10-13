import { attentionBands, result, type AttentionBand } from '../../data/tests/attention-span';

export const TOTAL_TRIALS = 80;
export const GREEN_COUNT = 60; // 75%
export const RED_COUNT = 20; // 25%
export const CIRCLE_DURATION_MS = 500; // 0.5 s
export const MIN_GAP_MS = 800; // 0.8 s
export const MAX_GAP_MS = 1600; // 1.6 s
export const PRACTICE_COUNT = 6;

export type CircleColor = 'green' | 'red';

export interface TrialResult {
  color: CircleColor;
  clicked: boolean;
  reactionTimeMs?: number;
}

export interface AttentionScores {
  focus: number; // 0-100 (% of greens clicked in time)
  selfControl: number; // 0-100 (% of reds correctly ignored)
  speed: number; // average RT on greens in ms (0 if none)
  overall: number; // average of focus and selfControl (0-100)
  greensCaught: number;
  greensTotal: number;
  redsIgnored: number;
  redsTotal: number;
  steadiness: {
    firstHalfFocus: number;
    secondHalfFocus: number;
    diff: number; // firstHalfFocus - secondHalfFocus
    dipped: boolean; // true if second half worse by 5+ points
  };
}

/**
 * Generates the sequence of 80 circles: exactly 60 green (75%), 20 red (25%).
 * Random order, never more than 2 reds in a row. `rand` returns [0, 1).
 */
export function generateAttentionTrials(rand: () => number = Math.random): CircleColor[] {
  let attempts = 0;
  while (attempts++ < 1000) {
    const list: CircleColor[] = [];
    let remainingGreens = GREEN_COUNT;
    let remainingReds = RED_COUNT;
    let consecutiveReds = 0;
    let valid = true;

    for (let i = 0; i < TOTAL_TRIALS; i++) {
      const remainingTotal = remainingGreens + remainingReds;
      if (remainingTotal === 0) break;

      // Rule: never more than 2 reds in a row.
      const mustPickGreen = consecutiveReds >= 2 || remainingReds === 0;
      // To avoid impossible situations where we're forced to pick 3 reds later:
      // In the worst case, each green can separate at most 2 reds, so max reds = remainingGreens * 2 + (consecutiveReds === 0 ? 2 : 2 - consecutiveReds).
      const maxAllowedReds = remainingGreens * 2 + (2 - consecutiveReds);
      const mustPickRed = remainingGreens === 0 || remainingReds > maxAllowedReds;

      if (mustPickGreen && mustPickRed) {
        valid = false;
        break;
      }

      let pickGreen: boolean;
      if (mustPickGreen) {
        pickGreen = true;
      } else if (mustPickRed) {
        pickGreen = false;
      } else {
        const greenProb = remainingGreens / remainingTotal;
        pickGreen = rand() < greenProb;
      }

      if (pickGreen) {
        list.push('green');
        remainingGreens--;
        consecutiveReds = 0;
      } else {
        list.push('red');
        remainingReds--;
        consecutiveReds++;
      }
    }

    if (valid && list.length === TOTAL_TRIALS && remainingGreens === 0 && remainingReds === 0) {
      return list;
    }
  }

  // Deterministic fallback (should never be reached)
  const fallback: CircleColor[] = [];
  for (let i = 0; i < 20; i++) {
    fallback.push('green', 'green', 'green', 'red');
  }
  return fallback;
}

/**
 * Preset practice sequence: 6 rounds with both colours (4 greens, 2 reds, no 3 reds).
 */
export function getPracticeTrials(): CircleColor[] {
  return ['green', 'green', 'red', 'green', 'red', 'green'];
}

/**
 * Random gap between circles from 0.8 s to 1.6 s (800 to 1600 ms).
 */
export function getGapMs(rand: () => number = Math.random): number {
  return MIN_GAP_MS + rand() * (MAX_GAP_MS - MIN_GAP_MS);
}

/**
 * Pure scoring calculation for Attention Span test.
 */
export function calculateAttentionScores(trials: readonly TrialResult[]): AttentionScores {
  const greens = trials.filter((t) => t.color === 'green');
  const greensTotal = greens.length;
  const greensCaught = greens.filter((t) => t.clicked).length;
  const focus = greensTotal > 0 ? Math.round((greensCaught / greensTotal) * 100) : 0;

  const reds = trials.filter((t) => t.color === 'red');
  const redsTotal = reds.length;
  const redsIgnored = reds.filter((t) => !t.clicked).length;
  const selfControl = redsTotal > 0 ? Math.round((redsIgnored / redsTotal) * 100) : 0;

  const greenHits = greens.filter((t) => t.clicked && typeof t.reactionTimeMs === 'number');
  const speed =
    greenHits.length > 0
      ? Math.round(greenHits.reduce((sum, t) => sum + (t.reactionTimeMs ?? 0), 0) / greenHits.length)
      : 0;

  const overall = Math.round((focus + selfControl) / 2);

  // Steadiness: compare first half with second half
  const half = Math.floor(trials.length / 2);
  const firstHalf = trials.slice(0, half);
  const secondHalf = trials.slice(half);

  const firstGreens = firstHalf.filter((t) => t.color === 'green');
  const firstGreensCaught = firstGreens.filter((t) => t.clicked).length;
  const firstHalfFocus = firstGreens.length > 0 ? Math.round((firstGreensCaught / firstGreens.length) * 100) : 0;

  const secondGreens = secondHalf.filter((t) => t.color === 'green');
  const secondGreensCaught = secondGreens.filter((t) => t.clicked).length;
  const secondHalfFocus = secondGreens.length > 0 ? Math.round((secondGreensCaught / secondGreens.length) * 100) : 0;

  const diff = firstHalfFocus - secondHalfFocus;
  const dipped = diff >= 5;

  return {
    focus,
    selfControl,
    speed,
    overall,
    greensCaught,
    greensTotal,
    redsIgnored,
    redsTotal,
    steadiness: {
      firstHalfFocus,
      secondHalfFocus,
      diff,
      dipped,
    },
  };
}

/**
 * Result band lookup by overall attention score (0-100).
 */
export function getBand(overall: number): AttentionBand {
  return [...attentionBands].reverse().find((b) => overall >= b.min) ?? attentionBands[0];
}

/**
 * "What does it mean?" line from the content doc.
 */
export function meaningLine(scores: AttentionScores): string {
  const band = getBand(scores.overall);
  let line = `${band.text} You caught ${scores.focus}% of greens and held back on ${scores.selfControl}% of reds.`;
  if (scores.steadiness.dipped) {
    line += ` ${result.dippedNote}`;
  }
  return line;
}

/**
 * Marker position on the scale bar (0–100).
 */
export function scalePercent(overall: number): number {
  return Math.max(2, Math.min(98, overall));
}

export function shareText(overall: number): string {
  return `My attention score: ${overall}/100 — ${getBand(overall).badge}. Can you beat it?`;
}
