import { result, stroopBands, ui, type StroopBand } from '../../data/tests/stroop';

export type StroopColor = 'red' | 'blue' | 'green' | 'yellow';

export const STROOP_COLORS: readonly StroopColor[] = ['red', 'blue', 'green', 'yellow'];

export const TOTAL_TRIALS = 40;
export const CONGRUENT_COUNT = 20; // 20 matching
export const INCONGRUENT_COUNT = 20; // 20 clashing
export const WORD_TIMEOUT_MS = 3000; // max 3 s per word
export const GAP_MS = 400; // 0.4 s gap between words
export const PRACTICE_COUNT = 4;

export interface StroopTrial {
  word: StroopColor;
  ink: StroopColor;
  congruent: boolean;
}

export interface StroopResponse {
  trial: StroopTrial;
  picked?: StroopColor;
  correct: boolean;
  reactionTimeMs?: number;
}

export interface StroopScores {
  matchingAvgMs: number;
  clashingAvgMs: number;
  stroopEffectMs: number;
  /** False when either word type has no correct answer: there's no effect to report. */
  measured: boolean;
  accuracy: number; // 0-100%
  under85Note: boolean;
  matchingCorrectCount: number;
  matchingTotal: number;
  clashingCorrectCount: number;
  clashingTotal: number;
  totalCorrect: number;
  totalTrials: number;
}

/**
 * Generates 40 trials in random order:
 * - 20 matching (ink === word)
 * - 20 clashing (ink !== word)
 * - The same word never appears twice in a row (trials[i].word !== trials[i-1].word).
 * `rand` returns [0, 1).
 */
export function generateStroopTrials(rand: () => number = Math.random): StroopTrial[] {
  let attempts = 0;
  while (attempts++ < 1000) {
    // 1. Build the pool of 20 matching and 20 clashing
    const pool: StroopTrial[] = [];
    // 5 matching of each colour = 20 matching
    for (const c of STROOP_COLORS) {
      for (let i = 0; i < 5; i++) {
        pool.push({ word: c, ink: c, congruent: true });
      }
    }
    // 5 clashing of each colour = 20 clashing
    for (const c of STROOP_COLORS) {
      const otherColors = STROOP_COLORS.filter((o) => o !== c);
      for (let i = 0; i < 5; i++) {
        const ink = otherColors[Math.floor(rand() * otherColors.length)];
        pool.push({ word: c, ink, congruent: false });
      }
    }

    // 2. Greedily arrange pool items such that word never repeats consecutively
    const remaining = [...pool];
    const resultList: StroopTrial[] = [];
    let prevWord: StroopColor | null = null;
    let valid = true;

    for (let step = 0; step < TOTAL_TRIALS; step++) {
      const candidates = remaining.filter((t) => t.word !== prevWord);
      if (candidates.length === 0) {
        valid = false;
        break;
      }

      // Pick randomly among candidates
      const chosenIdx = Math.floor(rand() * candidates.length);
      const chosen = candidates[chosenIdx];

      // Remove chosen from remaining
      const remIdx = remaining.indexOf(chosen);
      remaining.splice(remIdx, 1);

      resultList.push(chosen);
      prevWord = chosen.word;
    }

    if (valid && resultList.length === TOTAL_TRIALS) {
      return resultList;
    }
  }

  // Deterministic fallback (should never be reached)
  const fallback: StroopTrial[] = [];
  for (let i = 0; i < 10; i++) {
    fallback.push(
      { word: 'red', ink: 'red', congruent: true },
      { word: 'blue', ink: 'green', congruent: false },
      { word: 'green', ink: 'green', congruent: true },
      { word: 'yellow', ink: 'red', congruent: false }
    );
  }
  return fallback;
}

/**
 * 4 practice rounds with feedback (2 matching, 2 clashing, no consecutive words).
 */
export function getPracticeTrials(): StroopTrial[] {
  return [
    { word: 'red', ink: 'red', congruent: true },
    { word: 'blue', ink: 'green', congruent: false },
    { word: 'yellow', ink: 'yellow', congruent: true },
    { word: 'green', ink: 'red', congruent: false },
  ];
}

/**
 * Pure scoring function for Stroop test.
 */
export function calculateStroopScores(responses: readonly StroopResponse[]): StroopScores {
  const totalTrials = responses.length;
  const totalCorrect = responses.filter((r) => r.correct).length;
  const accuracy = totalTrials > 0 ? Math.round((totalCorrect / totalTrials) * 100) : 0;
  const under85Note = accuracy < 85;

  const matchingResponses = responses.filter((r) => r.trial.congruent);
  const matchingTotal = matchingResponses.length;
  const matchingCorrect = matchingResponses.filter((r) => r.correct && typeof r.reactionTimeMs === 'number');
  const matchingCorrectCount = matchingCorrect.length;
  const matchingAvgMs =
    matchingCorrectCount > 0
      ? Math.round(matchingCorrect.reduce((sum, r) => sum + (r.reactionTimeMs ?? 0), 0) / matchingCorrectCount)
      : 0;

  const clashingResponses = responses.filter((r) => !r.trial.congruent);
  const clashingTotal = clashingResponses.length;
  const clashingCorrect = clashingResponses.filter((r) => r.correct && typeof r.reactionTimeMs === 'number');
  const clashingCorrectCount = clashingCorrect.length;
  const clashingAvgMs =
    clashingCorrectCount > 0
      ? Math.round(clashingCorrect.reduce((sum, r) => sum + (r.reactionTimeMs ?? 0), 0) / clashingCorrectCount)
      : 0;

  // Stroop effect = avg time on clashing - avg time on matching (correct answers only)
  // If either has 0 correct answers, the effect can't be measured (and is 0)
  const measured = matchingCorrectCount > 0 && clashingCorrectCount > 0;
  const stroopEffectMs = measured ? Math.round(clashingAvgMs - matchingAvgMs) : 0;

  return {
    matchingAvgMs,
    clashingAvgMs,
    stroopEffectMs,
    measured,
    accuracy,
    under85Note,
    matchingCorrectCount,
    matchingTotal,
    clashingCorrectCount,
    clashingTotal,
    totalCorrect,
    totalTrials,
  };
}

/**
 * Result band lookup:
 * Under 80 ms -> Unshakeable
 * 80–160 ms -> Mild pull
 * 161–250 ms -> Word-pulled
 * Over 250 ms -> Strongly pulled
 */
export function getBand(effectMs: number): StroopBand {
  return [...stroopBands].reverse().find((b) => effectMs >= b.min) ?? stroopBands[0];
}

/**
 * "What does it mean?" line from the content doc.
 */
export function meaningLine(scores: StroopScores): string {
  // Not measured: say why when it was the clashing words (none answered correctly).
  if (!scores.measured) return scores.clashingCorrectCount === 0 ? result.notMeasuredClashing : result.notMeasured;
  // 0 ms or less: just the one line, since the band text ("barely slowed you down") would contradict it.
  let line =
    scores.stroopEffectMs > 0
      ? `Clashing words slowed you down by ${scores.stroopEffectMs} ms. ${getBand(scores.stroopEffectMs).text}`
      : result.noSlowdown;
  if (scores.under85Note) {
    line += ` ${ui.lowAccuracyNote}`;
  }
  return line;
}

/**
 * Marker position on result scale (0–320 ms range).
 */
export function scalePercent(effectMs: number): number {
  return Math.max(2, Math.min(98, (effectMs / 320) * 100));
}

/** The effect as shown everywhere: "No slowdown" at 0 ms or less, never a negative number. The stored value stays as it is. */
export function effectLabel(effectMs: number): string {
  return effectMs > 0 ? `${effectMs} ms` : result.noSlowdownLabel;
}

export function shareText(effectMs: number): string {
  return `My Stroop effect: ${effectLabel(effectMs)}, ${getBand(effectMs).badge}. Can you beat it?`;
}
