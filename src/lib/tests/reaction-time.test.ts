import { describe, expect, it } from 'vitest';
import { fillPercent, getBand, isGuess } from './reaction-time';

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
