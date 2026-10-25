import { describe, expect, it } from 'vitest';
import {
  BIGGER_GRID_MS,
  DISPLAY_MS,
  getBand,
  gridSize,
  growsAt,
  LIVES,
  meaningLine,
  newPattern,
  nextRound,
  pick,
  redeal,
  scalePercent,
  startGame,
  tileCount,
  type PhotoState,
} from './photographic-memory';
import { seeded } from './seeded';

/** A cell that is not in the pattern. */
const wrongCell = (s: PhotoState) => Array.from({ length: gridSize(s.level) ** 2 }, (_, i) => i).find((i) => !s.pattern.includes(i))!;

describe('grid and tiles', () => {
  it.each([
    [1, 3, 3],
    [3, 3, 5],
    [4, 4, 6],
    [7, 4, 9],
    [8, 5, 10],
    [11, 5, 13],
    [12, 6, 14],
    [20, 6, 22],
  ])('level %i → %i×%i grid, %i tiles', (level, size, tiles) => {
    expect(gridSize(level)).toBe(size);
    expect(tileCount(level)).toBe(tiles);
  });

  it('never asks for more tiles than the grid holds', () => {
    expect(tileCount(34)).toBe(36);
    expect(tileCount(80)).toBe(36);
  });

  it('shows the bigger-grid line only at levels 4, 8 and 12', () => {
    const levels = Array.from({ length: 20 }, (_, i) => i + 1).filter(growsAt);
    expect(levels).toEqual([4, 8, 12]);
  });

  it('times match part-2.md', () => {
    expect(DISPLAY_MS).toBe(1200);
    expect(BIGGER_GRID_MS).toBe(1000);
    expect(LIVES).toBe(3);
  });

  it('deals unique cells inside the grid', () => {
    const rand = seeded(7);
    for (let level = 1; level <= 40; level++) {
      for (let k = 0; k < 50; k++) {
        const p = newPattern(level, rand);
        expect(p).toHaveLength(tileCount(level));
        expect(new Set(p).size).toBe(p.length);
        for (const c of p) expect(c >= 0 && c < gridSize(level) ** 2).toBe(true);
      }
    }
  });
});

describe('pick', () => {
  it('counts correct tiles, completes the level, then moves up', () => {
    let s = startGame(seeded(1));
    const [a, b, c] = s.pattern;
    let r = pick(s, a);
    expect(r.outcome).toBe('correct');
    r = pick(r.state, b);
    r = pick(r.state, c);
    expect(r.outcome).toBe('levelDone');
    expect(r.state.completed).toBe(1);
    expect(r.state.tilesRemembered).toBe(3);
    s = nextRound(r.state, seeded(2));
    expect(s.level).toBe(2);
    expect(s.pattern).toHaveLength(4);
    expect(s.picked).toEqual([]);
  });

  it('ignores a repeat pick', () => {
    const s = startGame(seeded(1));
    const r = pick(s, s.pattern[0]);
    const again = pick(r.state, s.pattern[0]);
    expect(again.outcome).toBe('ignored');
    expect(again.state).toBe(r.state);
  });

  it('a wrong tile costs a life and repeats the same level with a new pattern', () => {
    const s = startGame(seeded(3));
    const r = pick(pick(s, s.pattern[0]).state, wrongCell(s));
    expect(r.outcome).toBe('wrong');
    expect(r.state.lives).toBe(2);
    // The correct pick before the mistake still counts as remembered.
    expect(r.state.tilesRemembered).toBe(1);
    expect(pick(r.state, s.pattern[1]).outcome).toBe('ignored');
    const n = nextRound(r.state, seeded(4));
    expect(n.level).toBe(1);
    expect(n.pattern).not.toEqual(s.pattern);
  });

  it('ends after the third wrong tile and ignores picks after that', () => {
    let s = startGame(seeded(5));
    const outcomes: string[] = [];
    for (let i = 0; i < 3; i++) {
      const r = pick(s, wrongCell(s));
      outcomes.push(r.outcome);
      s = r.state.over ? r.state : nextRound(r.state, seeded(10 + i));
    }
    expect(outcomes).toEqual(['wrong', 'wrong', 'gameOver']);
    expect(s.over).toBe(true);
    expect(s.lives).toBe(0);
    expect(pick(s, s.pattern[0]).outcome).toBe('ignored');
  });
});

describe('full runs', () => {
  it('all correct to level 15, then three wrong: score 15', () => {
    const rand = seeded(42);
    let s = startGame(rand);
    let total = 0;
    while (s.level <= 15) {
      let r = { state: s, outcome: '' as string };
      for (const c of s.pattern) r = pick(r.state, c);
      expect(r.outcome).toBe('levelDone');
      total += s.pattern.length;
      s = nextRound(r.state, rand);
    }
    for (let i = 0; i < 3; i++) {
      const r = pick(s, wrongCell(s));
      s = r.state.over ? r.state : nextRound(r.state, rand);
    }
    expect(s.over).toBe(true);
    expect(s.completed).toBe(15);
    expect(s.tilesRemembered).toBe(total);
    expect(total).toBe(Array.from({ length: 15 }, (_, i) => i + 3).reduce((a, b) => a + b, 0));
    expect(getBand(s.completed).badge).toBe('Exceptional');
  });

  it('all wrong: score 0, no tiles, first band', () => {
    const rand = seeded(9);
    let s = startGame(rand);
    while (!s.over) {
      const r = pick(s, wrongCell(s));
      s = r.state.over ? r.state : nextRound(r.state, rand);
    }
    expect(s.completed).toBe(0);
    expect(s.tilesRemembered).toBe(0);
    expect(getBand(0).badge).toBe('Warming up');
    // Q2-12: its own kind line, badge unchanged.
    expect(meaningLine(0, 0)).toBe('No tiles landed this time. Try again; the first level starts small.');
  });

  it('level 0 with some tiles found keeps the band line and the tile count (Q2-12)', () => {
    expect(meaningLine(0, 2)).toBe(
      'This run ended in the early levels. You can try again if you like. You remembered 2 tiles in total.',
    );
  });
});

describe('bands', () => {
  it.each([
    [0, 'Warming up'],
    [1, 'Warming up'],
    [4, 'Warming up'],
    [5, 'Solid'],
    [8, 'Solid'],
    [9, 'Sharp'],
    [12, 'Sharp'],
    [13, 'Exceptional'],
    [40, 'Exceptional'],
  ])('level %i → %s', (score, badge) => {
    expect(getBand(score).badge).toBe(badge);
  });

  it('meaning line follows the content doc', () => {
    expect(meaningLine(9, 64)).toBe('You keep a lot of visual detail in mind at once. You remembered 64 tiles in total.');
  });

  it('marker stays on the bar', () => {
    expect(scalePercent(0)).toBe(2);
    expect(scalePercent(40)).toBe(98);
    expect(scalePercent(4)).toBeLessThan(25);
    expect(scalePercent(5)).toBeGreaterThan(25);
  });
});

describe('redeal after a tab switch (Q2-15)', () => {
  it('deals a new pattern for the same level, keeping lives, score and tiles', () => {
    const rand = seeded(7);
    let s: PhotoState = { ...startGame(rand), level: 5, lives: 2, completed: 4, tilesRemembered: 18 };
    s = { ...s, pattern: newPattern(5, rand), picked: [] };
    const before = s.pattern;
    const r = redeal(s, seeded(99));
    expect(r.pattern).not.toEqual(before);
    expect(r.pattern).toHaveLength(tileCount(5));
    expect(new Set(r.pattern).size).toBe(tileCount(5));
    expect(r.picked).toEqual([]);
    expect(r).toMatchObject({ level: 5, lives: 2, completed: 4, tilesRemembered: 18, over: false });
  });
});
