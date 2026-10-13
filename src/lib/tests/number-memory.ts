import { numberBands } from '../../data/tests/number-memory';
import type { MemoryBand } from '../../data/tests/photographic-memory';

export const START_DIGITS = 3;
export const LIVES = 2;
/** The one-time grouping tip shows before the first number this long. */
export const CHUNK_TIP_DIGITS = 7;
/** How long the grouping tip shows before the number appears. */
export const CHUNK_TIP_MS = 2000;

/** 1 second + 0.6 seconds per digit (3 digits = 2.8 s; 10 digits = 7 s). */
export function displayMs(digits: number): number {
  return 1000 + 600 * digits;
}

/**
 * A random number with `digits` digits, as a string. Never starts with 0, and never has
 * the same digit three times in a row. `rand` returns [0, 1).
 */
export function generateNumber(digits: number, rand: () => number = Math.random): string {
  let out = String(1 + Math.floor(rand() * 9));
  while (out.length < digits) {
    const d = String(Math.floor(rand() * 10));
    const n = out.length;
    if (n >= 2 && out[n - 1] === d && out[n - 2] === d) continue;
    out += d;
  }
  return out;
}

/** Digits only: trims a pasted answer and drops spaces, dashes and anything else. */
export function cleanAnswer(raw: string): string {
  return raw.trim().replace(/\D/g, '');
}

/**
 * Compares digit by digit over the longer of the two. A missing or extra digit counts as a mismatch
 * at its position.
 */
export function compareDigits(target: string, answer: string): { correct: boolean; mismatches: number[] } {
  const mismatches: number[] = [];
  for (let i = 0; i < Math.max(target.length, answer.length); i++) {
    if (target[i] !== answer[i]) mismatches.push(i);
  }
  return { correct: mismatches.length === 0, mismatches };
}

/** True when every mistake is somewhere between the first and last digit of the number. */
export function isMiddleMistake(length: number, mismatches: readonly number[]): boolean {
  return mismatches.length > 0 && mismatches.every((i) => i > 0 && i < length - 1);
}

export interface NumberState {
  digits: number;
  lives: number;
  /** Longest number typed correctly = the score ("digit span"). 0 if none. */
  best: number;
  tipShown: boolean;
  over: boolean;
}

export function startGame(): NumberState {
  return { digits: START_DIGITS, lives: LIVES, best: 0, tipShown: false, over: false };
}

/** Right answer: one digit longer. Wrong: lose a life, same length again. Out of lives: over. */
export function answer(state: NumberState, correct: boolean): NumberState {
  if (state.over) return state;
  if (correct) return { ...state, best: Math.max(state.best, state.digits), digits: state.digits + 1 };
  const lives = state.lives - 1;
  return { ...state, lives, over: lives <= 0 };
}

/** Whether the grouping tip shows before this round, and the state with it marked as shown. */
export function takeChunkTip(state: NumberState): { show: boolean; state: NumberState } {
  if (state.tipShown || state.digits < CHUNK_TIP_DIGITS) return { show: false, state };
  return { show: true, state: { ...state, tipShown: true } };
}

export function getBand(digits: number): MemoryBand {
  return [...numberBands].reverse().find((b) => digits >= b.min) ?? numberBands[0];
}

/** "What does it mean?" — "You held [N] digits. [band text]" (part-2.md result copy). */
export function meaningLine(digits: number): string {
  return `You held ${digits} ${digits === 1 ? 'digit' : 'digits'}. ${getBand(digits).text}`;
}

/** Marker position on the result bar, which shows 3–12 digits (bands 3–5, 6–7, 8–9, 10+). */
export function scalePercent(digits: number): number {
  return Math.max(2, Math.min(98, ((digits - 3 + 0.5) / 10) * 100));
}

export function shareText(digits: number): string {
  return `My digit span: ${digits} digits — ${getBand(digits).badge}. Can you beat it?`;
}
