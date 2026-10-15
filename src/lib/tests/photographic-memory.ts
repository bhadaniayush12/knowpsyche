import { photoBands, result, type MemoryBand } from '../../data/tests/photographic-memory';

export const LIVES = 3;
/** How long the tiles stay lit, every level (part-2.md: 1.2 seconds). */
export const DISPLAY_MS = 1200;
/** How long the "Bigger grid" line shows before levels 4, 8 and 12. */
export const BIGGER_GRID_MS = 1000;

/** 3×3 for levels 1–3, 4×4 from 4, 5×5 from 8, 6×6 from 12 on. */
export function gridSize(level: number): number {
  if (level >= 12) return 6;
  if (level >= 8) return 5;
  if (level >= 4) return 4;
  return 3;
}

/** Level 1 lights 3 tiles; each level adds one. Never more than the grid holds. */
export function tileCount(level: number): number {
  const size = gridSize(level);
  return Math.min(level + 2, size * size);
}

/** Levels where the grid grows (and the "Bigger grid" line shows). */
export function growsAt(level: number): boolean {
  return level === 4 || level === 8 || level === 12;
}

/** `tileCount(level)` different cell indexes (0 … size²−1), in random order. `rand` returns [0, 1). */
export function newPattern(level: number, rand: () => number = Math.random): number[] {
  const size = gridSize(level);
  const cells = Array.from({ length: size * size }, (_, i) => i);
  // Partial Fisher–Yates: shuffle only as many as needed.
  const n = tileCount(level);
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(rand() * (cells.length - i));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells.slice(0, n);
}

export interface PhotoState {
  level: number;
  lives: number;
  pattern: number[];
  picked: number[];
  /** Every correct tile picked so far, including those in rounds that later went wrong. */
  tilesRemembered: number;
  /** Highest level fully completed = the score. */
  completed: number;
  over: boolean;
}

export type PickOutcome = 'ignored' | 'correct' | 'levelDone' | 'wrong' | 'gameOver';

export function startGame(rand: () => number = Math.random): PhotoState {
  return { level: 1, lives: LIVES, pattern: newPattern(1, rand), picked: [], tilesRemembered: 0, completed: 0, over: false };
}

/**
 * One pick. A repeat pick (or any pick after the game ends) is ignored.
 * `levelDone` and `wrong` leave the round finished; call `nextRound` to deal the next pattern.
 */
export function pick(state: PhotoState, cell: number): { state: PhotoState; outcome: PickOutcome } {
  const roundOver = state.picked.length === state.pattern.length || state.picked.some((c) => !state.pattern.includes(c));
  if (state.over || roundOver || state.picked.includes(cell)) return { state, outcome: 'ignored' };
  const picked = [...state.picked, cell];
  if (!state.pattern.includes(cell)) {
    const lives = state.lives - 1;
    const over = lives <= 0;
    return { state: { ...state, picked, lives, over }, outcome: over ? 'gameOver' : 'wrong' };
  }
  const next = { ...state, picked, tilesRemembered: state.tilesRemembered + 1 };
  if (picked.length === state.pattern.length) return { state: { ...next, completed: state.level }, outcome: 'levelDone' };
  return { state: next, outcome: 'correct' };
}

/** After a finished round: the next level if it was completed, else the same level again. New pattern either way. */
export function nextRound(state: PhotoState, rand: () => number = Math.random): PhotoState {
  const level = state.completed >= state.level ? state.level + 1 : state.level;
  return { ...state, level, pattern: newPattern(level, rand), picked: [] };
}

export function getBand(score: number): MemoryBand {
  return [...photoBands].reverse().find((b) => score >= b.min) ?? photoBands[0];
}

/** "What does it mean?" — band text, then total tiles (part-2.md result copy). No level and no tile at all gets its own line. */
export function meaningLine(score: number, tiles: number): string {
  if (score === 0 && tiles === 0) return result.zeroLine;
  return `${getBand(score).text} You remembered ${tiles} ${tiles === 1 ? 'tile' : 'tiles'} in total.`;
}

/** Marker position on the result bar, which shows levels 1–16 (bands 1–4, 5–8, 9–12, 13+). */
export function scalePercent(score: number): number {
  return Math.max(2, Math.min(98, ((score - 0.5) / 16) * 100));
}

export function shareText(score: number): string {
  return `My photographic memory: level ${score}, ${getBand(score).badge}. Can you beat it?`;
}
