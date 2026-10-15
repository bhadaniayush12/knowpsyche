import { describe, expect, it } from 'vitest';
import {
  answer,
  CHUNK_TIP_DIGITS,
  cleanAnswer,
  compareDigits,
  displayMs,
  generateNumber,
  getBand,
  isMiddleMistake,
  LIVES,
  meaningLine,
  scalePercent,
  START_DIGITS,
  startGame,
  takeChunkTip,
  type NumberState,
} from './number-memory';
import { seeded } from './seeded';

describe('displayMs', () => {
  it('is 1 s + 0.6 s per digit', () => {
    expect(displayMs(3)).toBe(2800);
    expect(displayMs(7)).toBe(5200);
    expect(displayMs(10)).toBe(7000);
  });
});

describe('generateNumber', () => {
  it.each(Array.from({ length: 13 }, (_, i) => i + 3))('%i digits: 1,000 seeded runs keep every rule', (len) => {
    const rand = seeded(1000 + len);
    for (let k = 0; k < 1000; k++) {
      const n = generateNumber(len, rand);
      expect(n).toMatch(/^[1-9][0-9]*$/);
      expect(n).toHaveLength(len);
      expect(n).not.toMatch(/(\d)\1\1/);
    }
  });

  it('is repeatable with the same seed', () => {
    expect(generateNumber(12, seeded(5))).toBe(generateNumber(12, seeded(5)));
  });

  it('still works when the random source keeps giving the same digit', () => {
    // 0.55 → first digit 5, then 5 forever: the third 5 must be redrawn, so feed a different value next.
    const values = [0.55, 0.55, 0.55, 0.15, 0.55];
    let i = 0;
    const n = generateNumber(4, () => values[Math.min(i++, values.length - 1)]);
    expect(n).toBe('5515');
  });
});

describe('cleanAnswer', () => {
  it('trims pasted text and keeps digits only', () => {
    expect(cleanAnswer(' 49 21 73\n')).toBe('492173');
    expect(cleanAnswer('0123')).toBe('0123');
    expect(cleanAnswer('12-34')).toBe('1234');
    expect(cleanAnswer('   ')).toBe('');
  });
  it('turns full-width digits into plain digits (Q2-20)', () => {
    expect(cleanAnswer('４９２１７３')).toBe('492173');
    expect(cleanAnswer('４９　２１')).toBe('4921');
    expect(cleanAnswer('49２1')).toBe('4921');
  });
});

describe('compareDigits', () => {
  it('equal numbers match', () => {
    expect(compareDigits('4927', '4927')).toEqual({ correct: true, mismatches: [] });
  });
  it('finds a single wrong digit', () => {
    expect(compareDigits('4927', '4937')).toEqual({ correct: false, mismatches: [2] });
  });
  it('counts missing digits at the end', () => {
    expect(compareDigits('49271', '492')).toEqual({ correct: false, mismatches: [3, 4] });
  });
  it('counts extra digits', () => {
    expect(compareDigits('492', '4921')).toEqual({ correct: false, mismatches: [3] });
  });
  it('an empty answer misses every digit', () => {
    expect(compareDigits('123', '')).toEqual({ correct: false, mismatches: [0, 1, 2] });
  });
  it('a swap shows both positions', () => {
    expect(compareDigits('123456', '124356').mismatches).toEqual([2, 3]);
  });
});

describe('isMiddleMistake', () => {
  it('true only when all mistakes avoid the first and last digit', () => {
    expect(isMiddleMistake(7, [3])).toBe(true);
    expect(isMiddleMistake(7, [1, 5])).toBe(true);
    expect(isMiddleMistake(7, [0])).toBe(false);
    expect(isMiddleMistake(7, [6])).toBe(false);
    expect(isMiddleMistake(7, [3, 6])).toBe(false);
    expect(isMiddleMistake(7, [])).toBe(false);
    // A missing last digit is not a middle mistake.
    expect(isMiddleMistake(5, compareDigits('49271', '4927').mismatches)).toBe(false);
  });
});

describe('progression and lives', () => {
  it('starts at 3 digits with 2 lives', () => {
    expect(startGame()).toMatchObject({ digits: START_DIGITS, lives: LIVES, best: 0, over: false });
    expect(START_DIGITS).toBe(3);
    expect(LIVES).toBe(2);
  });

  it('a right answer adds a digit; a wrong one costs a life and keeps the length', () => {
    let s = answer(startGame(), true);
    expect(s).toMatchObject({ digits: 4, best: 3, lives: 2 });
    s = answer(s, false);
    expect(s).toMatchObject({ digits: 4, best: 3, lives: 1, over: false });
    s = answer(s, true);
    expect(s).toMatchObject({ digits: 5, best: 4, lives: 1 });
    s = answer(s, false);
    expect(s).toMatchObject({ digits: 5, best: 4, lives: 0, over: true });
    expect(answer(s, true)).toBe(s);
  });

  it('shows the grouping tip once, the first time the number reaches 7 digits', () => {
    let s: NumberState = startGame();
    const shownAt: number[] = [];
    while (s.digits <= 10) {
      const t = takeChunkTip(s);
      if (t.show) shownAt.push(s.digits);
      s = t.state;
      // Fail once at 7 to repeat that length: the tip must not show again.
      s = s.digits === 7 && s.lives === 2 ? answer(s, false) : answer(s, true);
    }
    expect(shownAt).toEqual([CHUNK_TIP_DIGITS]);
  });
});

describe('full runs', () => {
  it('all correct to 12 digits, then two wrong: span 12', () => {
    let s = startGame();
    while (s.digits <= 12) s = answer(s, true);
    s = answer(answer(s, false), false);
    expect(s.over).toBe(true);
    expect(s.best).toBe(12);
    expect(getBand(s.best).badge).toBe('Exceptional');
  });

  it('all wrong: span 0, first band', () => {
    const s = answer(answer(startGame(), false), false);
    expect(s).toMatchObject({ over: true, best: 0, digits: 3 });
    expect(getBand(0).badge).toBe('Warming up');
    // Q2-12: its own kind line, badge unchanged.
    expect(meaningLine(0)).toBe('No number landed this time. That happens, and a fresh try often goes differently.');
  });
});

describe('bands', () => {
  it.each([
    [0, 'Warming up'],
    [3, 'Warming up'],
    [5, 'Warming up'],
    [6, 'Steady'],
    [7, 'Steady'],
    [8, 'Strong'],
    [9, 'Strong'],
    [10, 'Exceptional'],
    [20, 'Exceptional'],
  ])('%i digits → %s', (n, badge) => {
    expect(getBand(n).badge).toBe(badge);
  });

  it('meaning line follows the content doc', () => {
    expect(meaningLine(7)).toBe('You held 7 digits. Six or seven digits held at once, a steady span for this task.');
  });

  it('marker stays on the bar and inside the right band', () => {
    expect(scalePercent(0)).toBe(2);
    expect(scalePercent(30)).toBe(98);
    expect(scalePercent(5)).toBeLessThan(30);
    expect(scalePercent(6)).toBeGreaterThan(30);
  });
});
