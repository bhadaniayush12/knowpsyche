import { describe, expect, it } from 'vitest';
import {
  addTry,
  f1HoldMs,
  f1LightsOn,
  f1Total,
  fillPercent,
  getBand,
  isGuess,
  isInconsistent,
  meaningLine,
  shareText,
  summarize,
  TRIES,
  waitMs,
} from './reaction-time';

describe('isGuess', () => {
  it('treats anything under 100 ms as a guess', () => {
    expect(isGuess(0)).toBe(true);
    expect(isGuess(99)).toBe(true);
    expect(isGuess(99.9)).toBe(true);
    expect(isGuess(100)).toBe(false);
  });
});

describe('getBand', () => {
  it.each([
    [100, 'Lightning'],
    [199, 'Lightning'],
    [200, 'Quick'],
    [250, 'Quick'],
    [251, 'Steady'],
    [300, 'Steady'],
    [301, 'Needs a coffee'],
    [400, 'Needs a coffee'],
    [401, 'Running on empty'],
    [5000, 'Running on empty'],
  ])('%i ms → %s', (ms, badge) => {
    expect(getBand(ms).badge).toBe(badge);
  });

  it('rounds before picking a band', () => {
    expect(getBand(199.4).badge).toBe('Lightning');
    expect(getBand(199.6).badge).toBe('Quick');
  });
});

describe('fillPercent', () => {
  it('clamps to 4–100', () => {
    expect(fillPercent(0)).toBe(4);
    expect(fillPercent(300)).toBe(50);
    expect(fillPercent(900)).toBe(100);
  });
});

describe('addTry', () => {
  it('counts a valid try and rounds it', () => {
    expect(addTry([], 247.6)).toEqual({ tries: [248], counted: true, done: false });
  });

  it('counts exactly 100 ms but not 99.9 ms', () => {
    expect(addTry([], 100).counted).toBe(true);
    expect(addTry([], 99.9)).toEqual({ tries: [], counted: false, done: false });
  });

  it('a guess does not use up a try', () => {
    let tries: number[] = [];
    for (const ms of [250, 40, 260, 0, 270]) tries = addTry(tries, ms).tries;
    expect(tries).toEqual([250, 260, 270]);
  });

  it('is done only after 5 valid tries', () => {
    let state = { tries: [] as number[], counted: false, done: false };
    for (let i = 0; i < TRIES - 1; i++) {
      state = addTry(state.tries, 300);
      expect(state.done).toBe(false);
    }
    state = addTry(state.tries, 300);
    expect(state.done).toBe(true);
    expect(state.tries).toHaveLength(5);
  });

  it('ignores extra tries once done, and does not mutate the input', () => {
    const full = [1, 2, 3, 4, 5].map((n) => n * 100 + 100);
    const out = addTry(full, 250);
    expect(out).toEqual({ tries: full, counted: false, done: true });
    expect(out.tries).not.toBe(full);
  });
});

describe('summarize', () => {
  it('works out average, fastest, slowest and spread', () => {
    expect(summarize([231, 262, 244, 255, 243])).toEqual({ average: 247, fastest: 231, slowest: 262, spread: 31 });
  });

  it('all the same → spread 0', () => {
    expect(summarize([250, 250, 250, 250, 250])).toEqual({ average: 250, fastest: 250, slowest: 250, spread: 0 });
  });

  it('handles ties for fastest', () => {
    const s = summarize([200, 200, 300, 300, 250]);
    expect(s.fastest).toBe(200);
    expect(s.spread).toBe(100);
  });

  it('rounds the average to the nearest ms', () => {
    expect(summarize([200, 201]).average).toBe(201); // 200.5
    expect(summarize([200, 200, 201]).average).toBe(200); // 200.33
    expect(summarize([200, 201, 201]).average).toBe(201); // 200.67
  });

  it('throws with no tries', () => {
    expect(() => summarize([])).toThrow();
  });
});

describe('isInconsistent', () => {
  it('only flags a spread over 60 ms', () => {
    expect(isInconsistent(0)).toBe(false);
    expect(isInconsistent(60)).toBe(false);
    expect(isInconsistent(61)).toBe(true);
  });
});

describe('meaningLine', () => {
  it('joins band text, fastest and spread without a double full stop', () => {
    const line = meaningLine(summarize([231, 262, 244, 255, 243]));
    expect(line).toBe('A little quicker than typical. Your fastest try was 231 ms, and your tries were 31 ms apart.');
    expect(line).not.toContain('..');
  });

  it('uses the band of the average', () => {
    expect(meaningLine(summarize([450, 450, 450, 450, 450]))).toMatch(/^Try again on a computer with a mouse, after a short break\. /);
  });
});

describe('shareText', () => {
  it('matches the content doc format', () => {
    expect(shareText(247)).toBe('My reaction time: 247 ms, Quick. Can you beat it?');
    expect(shareText(180)).toBe('My reaction time: 180 ms, Lightning. Can you beat it?');
  });
});

describe('random waits', () => {
  it('waitMs is 1.5–4 s', () => {
    expect(waitMs(() => 0)).toBe(1500);
    expect(waitMs(() => 0.999999)).toBeLessThan(4000);
    expect(waitMs(() => 0.999999)).toBeGreaterThan(3999);
  });

  it('f1HoldMs is 0.5–3 s', () => {
    expect(f1HoldMs(() => 0)).toBe(500);
    expect(f1HoldMs(() => 0.999999)).toBeLessThan(3000);
  });
});

describe('F1 lights', () => {
  it('switches on one light per second, up to five', () => {
    expect(f1LightsOn(-1)).toBe(0);
    expect(f1LightsOn(0)).toBe(1);
    expect(f1LightsOn(999)).toBe(1);
    expect(f1LightsOn(1000)).toBe(2);
    expect(f1LightsOn(4000)).toBe(5);
    expect(f1LightsOn(9000)).toBe(5);
  });

  it('lights go out after the fifth light plus the hold', () => {
    expect(f1Total(500)).toBe(4500);
  });
});
