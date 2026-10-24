import { describe, expect, it } from 'vitest';
import {
  calculateAttentionScores,
  generateAttentionTrials,
  getBand,
  getGapMs,
  getPracticeTrials,
  meaningLine,
  scalePercent,
  shareText,
  GREEN_COUNT,
  RED_COUNT,
  TOTAL_TRIALS,
  type TrialResult,
} from './attention-span';
import { seeded } from './seeded';

describe('Attention span: trial generation over 1,000 seeded runs', () => {
  it('generates 80 circles: 60 green (75%), 20 red (25%), never > 2 reds in a row', () => {
    for (let s = 1; s <= 1000; s++) {
      const rand = seeded(s);
      const trials = generateAttentionTrials(rand);

      expect(trials).toHaveLength(TOTAL_TRIALS);

      const greens = trials.filter((t) => t === 'green').length;
      const reds = trials.filter((t) => t === 'red').length;

      expect(greens).toBe(GREEN_COUNT);
      expect(reds).toBe(RED_COUNT);

      // Verify no sequence has 3 or more reds in a row
      let redStreak = 0;
      for (const t of trials) {
        if (t === 'red') {
          redStreak++;
          expect(redStreak).toBeLessThanOrEqual(2);
        } else {
          redStreak = 0;
        }
      }
    }
  });

  it('practice trials has 6 rounds with green and red', () => {
    const practice = getPracticeTrials();
    expect(practice).toHaveLength(6);
    expect(practice).toContain('green');
    expect(practice).toContain('red');
  });

  it('gap timing varies between 800 and 1600 ms', () => {
    const rand = seeded(42);
    for (let i = 0; i < 50; i++) {
      const gap = getGapMs(rand);
      expect(gap).toBeGreaterThanOrEqual(800);
      expect(gap).toBeLessThanOrEqual(1600);
    }
  });
});

describe('Attention span: scoring and edge cases', () => {
  it('calculates perfect run correctly (100% focus, 100% self-control)', () => {
    const trials: TrialResult[] = [];
    for (let i = 0; i < 60; i++) {
      trials.push({ color: 'green', clicked: true, reactionTimeMs: 250 });
    }
    for (let i = 0; i < 20; i++) {
      trials.push({ color: 'red', clicked: false });
    }

    const scores = calculateAttentionScores(trials);
    expect(scores.focus).toBe(100);
    expect(scores.selfControl).toBe(100);
    expect(scores.overall).toBe(100);
    expect(scores.speed).toBe(250);
    expect(scores.greensCaught).toBe(60);
    expect(scores.redsIgnored).toBe(20);
    expect(scores.steadiness.dipped).toBe(false);
  });

  it('calculates all-wrong run (0% focus, 0% self-control)', () => {
    const trials: TrialResult[] = [];
    // Greens missed
    for (let i = 0; i < 60; i++) {
      trials.push({ color: 'green', clicked: false });
    }
    // Reds clicked
    for (let i = 0; i < 20; i++) {
      trials.push({ color: 'red', clicked: true, reactionTimeMs: 300 });
    }

    const scores = calculateAttentionScores(trials);
    expect(scores.focus).toBe(0);
    expect(scores.selfControl).toBe(0);
    expect(scores.overall).toBe(0);
    expect(scores.speed).toBe(0); // No correct green clicks
    expect(scores.greensCaught).toBe(0);
    expect(scores.redsIgnored).toBe(0);
  });

  it('handles empty trials gracefully without NaN or errors', () => {
    const scores = calculateAttentionScores([]);
    expect(scores.focus).toBe(0);
    expect(scores.selfControl).toBe(0);
    expect(scores.overall).toBe(0);
    expect(scores.speed).toBe(0);
    expect(scores.greensCaught).toBe(0);
    expect(scores.redsIgnored).toBe(0);
    expect(scores.steadiness.dipped).toBe(false);
  });

  it('calculates partial focus, self-control and average speed', () => {
    const trials: TrialResult[] = [
      // 10 greens: 8 clicked (4 at 200ms, 4 at 300ms => avg 250ms), 2 missed
      ...Array.from({ length: 4 }, () => ({ color: 'green' as const, clicked: true, reactionTimeMs: 200 })),
      ...Array.from({ length: 4 }, () => ({ color: 'green' as const, clicked: true, reactionTimeMs: 300 })),
      ...Array.from({ length: 2 }, () => ({ color: 'green' as const, clicked: false })),
      // 10 reds: 7 ignored, 3 clicked
      ...Array.from({ length: 7 }, () => ({ color: 'red' as const, clicked: false })),
      ...Array.from({ length: 3 }, () => ({ color: 'red' as const, clicked: true, reactionTimeMs: 220 })),
    ];

    const scores = calculateAttentionScores(trials);
    expect(scores.focus).toBe(80); // 8/10 = 80%
    expect(scores.selfControl).toBe(70); // 7/10 = 70%
    expect(scores.overall).toBe(75); // (80 + 70)/2 = 75
    expect(scores.speed).toBe(250); // average of (4*200 + 4*300)/8 = 250
  });
});

describe('Attention span: steadiness comparison', () => {
  it('detects focus dip when second half is worse by exactly 5 points', () => {
    // 40 trials in first half: 30 greens (all clicked = 100%), 10 reds
    const firstHalf: TrialResult[] = [
      ...Array.from({ length: 30 }, () => ({ color: 'green' as const, clicked: true, reactionTimeMs: 240 })),
      ...Array.from({ length: 10 }, () => ({ color: 'red' as const, clicked: false })),
    ];
    // 40 trials in second half: 30 greens (missed some so focus is 95%), 10 reds
    // 95% of 30 is 28.5, let's make it 28/30 = 93.3% or 19/20
    // If firstHalfFocus = 100, secondHalfFocus = 95 -> diff = 5 -> dipped = true
    const trials: TrialResult[] = [
      // First half: 20 greens, 18 clicked => 90%
      ...Array.from({ length: 18 }, () => ({ color: 'green' as const, clicked: true, reactionTimeMs: 240 })),
      ...Array.from({ length: 2 }, () => ({ color: 'green' as const, clicked: false })),
      // Second half: 20 greens, 17 clicked => 85%
      ...Array.from({ length: 17 }, () => ({ color: 'green' as const, clicked: true, reactionTimeMs: 240 })),
      ...Array.from({ length: 3 }, () => ({ color: 'green' as const, clicked: false })),
    ];

    const scores = calculateAttentionScores(trials);
    expect(scores.steadiness.firstHalfFocus).toBe(90);
    expect(scores.steadiness.secondHalfFocus).toBe(85);
    expect(scores.steadiness.diff).toBe(5);
    expect(scores.steadiness.dipped).toBe(true);

    const line = meaningLine(scores);
    expect(line).toContain('Your score was lower in the second half. This comparison does not establish why it changed or whether a dip is expected.');
  });

  it('does not flag dip when second half is worse by only 4 points', () => {
    // First half focus 100%, second half 96% -> diff 4
    const trials: TrialResult[] = [
      // First half (25 greens): 25/25 = 100%
      ...Array.from({ length: 25 }, () => ({ color: 'green' as const, clicked: true, reactionTimeMs: 240 })),
      // Second half (25 greens): 24/25 = 96%
      ...Array.from({ length: 24 }, () => ({ color: 'green' as const, clicked: true, reactionTimeMs: 240 })),
      ...Array.from({ length: 1 }, () => ({ color: 'green' as const, clicked: false })),
    ];

    const scores = calculateAttentionScores(trials);
    expect(scores.steadiness.firstHalfFocus).toBe(100);
    expect(scores.steadiness.secondHalfFocus).toBe(96);
    expect(scores.steadiness.diff).toBe(4);
    expect(scores.steadiness.dipped).toBe(false);

    const line = meaningLine(scores);
    expect(line).not.toContain("Your focus dipped in the second half");
  });

  it('does not flag dip when second half is equal or better', () => {
    const trials: TrialResult[] = [
      // First half: 80% focus
      ...Array.from({ length: 8 }, () => ({ color: 'green' as const, clicked: true, reactionTimeMs: 250 })),
      ...Array.from({ length: 2 }, () => ({ color: 'green' as const, clicked: false })),
      // Second half: 90% focus
      ...Array.from({ length: 9 }, () => ({ color: 'green' as const, clicked: true, reactionTimeMs: 250 })),
      ...Array.from({ length: 1 }, () => ({ color: 'green' as const, clicked: false })),
    ];

    const scores = calculateAttentionScores(trials);
    expect(scores.steadiness.diff).toBe(-10);
    expect(scores.steadiness.dipped).toBe(false);
  });
});

describe('Attention span: band edges', () => {
  it('maps scores to correct bands at exact boundaries', () => {
    expect(getBand(0).badge).toBe('Drifting');
    expect(getBand(69).badge).toBe('Drifting');

    expect(getBand(70).badge).toBe('Steady');
    expect(getBand(84).badge).toBe('Steady');

    expect(getBand(85).badge).toBe('Focused');
    expect(getBand(94).badge).toBe('Focused');

    expect(getBand(95).badge).toBe('Laser');
    expect(getBand(100).badge).toBe('Laser');
  });

  it('formats scalePercent within 2% and 98%', () => {
    expect(scalePercent(0)).toBe(2);
    expect(scalePercent(50)).toBe(50);
    expect(scalePercent(100)).toBe(98);
  });

  it('formats shareText correctly', () => {
    expect(shareText(95)).toBe('My attention score: 95/100, Laser. Can you beat it?');
  });

  it('says "tapped" instead of "clicked" on touch screens', () => {
    // Every circle missed: overall under 70, the Drifting band.
    const trials: TrialResult[] = [
      ...Array.from({ length: 10 }, () => ({ color: 'green' as const, clicked: false })),
      ...Array.from({ length: 10 }, () => ({ color: 'red' as const, clicked: true, reactionTimeMs: 300 })),
    ];
    const scores = calculateAttentionScores(trials);
    expect(meaningLine(scores)).toContain('presses on red circles');
    expect(meaningLine(scores, true)).toContain('taps on red circles');
    expect(meaningLine(scores, true)).not.toContain('click');
  });
});
