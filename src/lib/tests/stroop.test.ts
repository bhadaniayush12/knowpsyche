import { describe, expect, it } from 'vitest';
import {
  calculateStroopScores,
  generateStroopTrials,
  getBand,
  getPracticeTrials,
  meaningLine,
  effectLabel,
  scalePercent,
  shareText,
  CONGRUENT_COUNT,
  INCONGRUENT_COUNT,
  TOTAL_TRIALS,
  type StroopResponse,
  type StroopTrial,
} from './stroop';
import { seeded } from './seeded';

describe('Stroop: trial generation over 1,000 seeded runs', () => {
  it('generates 40 trials: 20 matching, 20 clashing, no consecutive duplicate words', () => {
    for (let s = 1; s <= 1000; s++) {
      const rand = seeded(s);
      const trials = generateStroopTrials(rand);

      expect(trials).toHaveLength(TOTAL_TRIALS);

      const matching = trials.filter((t) => t.congruent).length;
      const clashing = trials.filter((t) => !t.congruent).length;

      expect(matching).toBe(CONGRUENT_COUNT);
      expect(clashing).toBe(INCONGRUENT_COUNT);

      // Verify congruency rules: matching has ink === word, clashing has ink !== word
      for (const t of trials) {
        if (t.congruent) {
          expect(t.ink).toBe(t.word);
        } else {
          expect(t.ink).not.toBe(t.word);
        }
      }

      // Verify rule: same word never appears twice in a row
      for (let i = 1; i < trials.length; i++) {
        expect(trials[i].word).not.toBe(trials[i - 1].word);
      }
    }
  });

  it('practice trials has 4 rounds with no consecutive duplicate words', () => {
    const practice = getPracticeTrials();
    expect(practice).toHaveLength(4);
    for (let i = 1; i < practice.length; i++) {
      expect(practice[i].word).not.toBe(practice[i - 1].word);
    }
  });
});

describe('Stroop: scoring and effect maths', () => {
  it('calculates Stroop effect as clashing average minus matching average', () => {
    const responses: StroopResponse[] = [
      // 2 matching, correct at 400ms and 500ms => avg 450ms
      { trial: { word: 'red', ink: 'red', congruent: true }, picked: 'red', correct: true, reactionTimeMs: 400 },
      { trial: { word: 'blue', ink: 'blue', congruent: true }, picked: 'blue', correct: true, reactionTimeMs: 500 },
      // 2 clashing, correct at 550ms and 650ms => avg 600ms
      { trial: { word: 'green', ink: 'red', congruent: false }, picked: 'red', correct: true, reactionTimeMs: 550 },
      { trial: { word: 'yellow', ink: 'blue', congruent: false }, picked: 'blue', correct: true, reactionTimeMs: 650 },
    ];

    const scores = calculateStroopScores(responses);
    expect(scores.matchingAvgMs).toBe(450);
    expect(scores.clashingAvgMs).toBe(600);
    expect(scores.stroopEffectMs).toBe(150); // 600 - 450 = 150
    expect(scores.accuracy).toBe(100);
    expect(scores.under85Note).toBe(false);
  });

  it('only counts correct answers for matching and clashing averages', () => {
    const responses: StroopResponse[] = [
      // Matching: 1 correct at 400ms, 1 wrong at 200ms => avg should be 400ms
      { trial: { word: 'red', ink: 'red', congruent: true }, picked: 'red', correct: true, reactionTimeMs: 400 },
      { trial: { word: 'blue', ink: 'blue', congruent: true }, picked: 'red', correct: false, reactionTimeMs: 200 },
      // Clashing: 1 correct at 500ms, 1 timeout/missed => avg should be 500ms
      { trial: { word: 'green', ink: 'red', congruent: false }, picked: 'red', correct: true, reactionTimeMs: 500 },
      { trial: { word: 'yellow', ink: 'blue', congruent: false }, correct: false },
    ];

    const scores = calculateStroopScores(responses);
    expect(scores.matchingAvgMs).toBe(400);
    expect(scores.clashingAvgMs).toBe(500);
    expect(scores.stroopEffectMs).toBe(100);
    expect(scores.accuracy).toBe(50); // 2 of 4 = 50%
  });

  it('handles empty run gracefully', () => {
    const scores = calculateStroopScores([]);
    expect(scores.matchingAvgMs).toBe(0);
    expect(scores.clashingAvgMs).toBe(0);
    expect(scores.stroopEffectMs).toBe(0);
    expect(scores.accuracy).toBe(0);
    expect(scores.totalCorrect).toBe(0);
    expect(scores.totalTrials).toBe(0);
  });

  it('handles all-wrong run (0% accuracy, 0 effect)', () => {
    const responses: StroopResponse[] = [
      { trial: { word: 'red', ink: 'red', congruent: true }, picked: 'blue', correct: false, reactionTimeMs: 400 },
      { trial: { word: 'green', ink: 'red', congruent: false }, picked: 'green', correct: false, reactionTimeMs: 450 },
    ];

    const scores = calculateStroopScores(responses);
    expect(scores.accuracy).toBe(0);
    expect(scores.matchingAvgMs).toBe(0);
    expect(scores.clashingAvgMs).toBe(0);
    expect(scores.stroopEffectMs).toBe(0);
    expect(scores.under85Note).toBe(true);
  });
});

describe('Stroop: 85% accuracy note at 84%, 85%, and 86%', () => {
  // Use 100 trials for exact percentage steps
  function makeTrialsWithAccuracy(acc: number): StroopResponse[] {
    const list: StroopResponse[] = [];
    for (let i = 0; i < 100; i++) {
      const isCorrect = i < acc;
      const congruent = i % 2 === 0;
      list.push({
        trial: { word: 'red', ink: congruent ? 'red' : 'blue', congruent },
        picked: isCorrect ? (congruent ? 'red' : 'blue') : 'yellow',
        correct: isCorrect,
        reactionTimeMs: 400,
      });
    }
    return list;
  }

  it('includes under-85% note at 84% accuracy', () => {
    const scores = calculateStroopScores(makeTrialsWithAccuracy(84));
    expect(scores.accuracy).toBe(84);
    expect(scores.under85Note).toBe(true);

    const line = meaningLine(scores);
    expect(line).toContain('You were quick on the words you answered, and missed several. Try again a little slower for a fairer score.');
  });

  it('excludes under-85% note at 85% accuracy', () => {
    const scores = calculateStroopScores(makeTrialsWithAccuracy(85));
    expect(scores.accuracy).toBe(85);
    expect(scores.under85Note).toBe(false);

    const line = meaningLine(scores);
    expect(line).not.toContain('missed several');
  });

  it('excludes under-85% note at 86% accuracy', () => {
    const scores = calculateStroopScores(makeTrialsWithAccuracy(86));
    expect(scores.accuracy).toBe(86);
    expect(scores.under85Note).toBe(false);

    const line = meaningLine(scores);
    expect(line).not.toContain('missed several');
  });
});

describe('Stroop: zero, negative and unmeasured effect', () => {
  const r = (congruent: boolean, ms: number, correct = true): StroopResponse => ({
    trial: congruent ? { word: 'red', ink: 'red', congruent } : { word: 'green', ink: 'red', congruent },
    picked: correct ? 'red' : 'blue',
    correct,
    reactionTimeMs: ms,
  });

  it('says the words didn\'t slow you down when the effect is negative, with the Under 80 band', () => {
    const scores = calculateStroopScores([r(true, 600), r(false, 500)]);
    expect(scores.measured).toBe(true);
    expect(scores.stroopEffectMs).toBe(-100);
    expect(getBand(scores.stroopEffectMs).badge).toBe('Unshakeable');
    expect(meaningLine(scores)).toBe('The clashing words did not slow you down.');
  });

  it('says the words didn\'t slow you down when the effect is exactly 0', () => {
    const scores = calculateStroopScores([r(true, 500), r(false, 500)]);
    expect(scores.measured).toBe(true);
    expect(scores.stroopEffectMs).toBe(0);
    expect(meaningLine(scores)).toBe('The clashing words did not slow you down.');
  });

  it('shows "No slowdown" for 0 ms or less, never a negative number (Q2-11)', () => {
    expect(effectLabel(-100)).toBe('No slowdown');
    expect(effectLabel(0)).toBe('No slowdown');
    expect(effectLabel(1)).toBe('1 ms');
    expect(shareText(-100)).toBe('My Stroop effect: No slowdown, Unshakeable. Can you beat it?');
    expect(shareText(0)).toBe('My Stroop effect: No slowdown, Unshakeable. Can you beat it?');
    // The stored value is not touched: scoring still returns the real (negative) number.
    expect(calculateStroopScores([r(true, 600), r(false, 500)]).stroopEffectMs).toBe(-100);
  });

  it('shows the ms number only when the effect is above 0', () => {
    const scores = calculateStroopScores([r(true, 500), r(false, 501)]);
    expect(meaningLine(scores)).toBe('Clashing words slowed you down by 1 ms. The clashing words barely slowed you down.');
  });

  it('cannot measure the effect when no matching word was answered correctly', () => {
    const scores = calculateStroopScores([r(true, 400, false), r(false, 500)]);
    expect(scores.measured).toBe(false);
    expect(scores.stroopEffectMs).toBe(0);
    expect(meaningLine(scores)).toBe("We couldn't measure this one. Try again.");
  });

  it('cannot measure the effect when no clashing word was answered correctly, and says why (Q2-16)', () => {
    const scores = calculateStroopScores([r(true, 400), r(false, 500, false)]);
    expect(scores.measured).toBe(false);
    expect(meaningLine(scores)).toBe('Too many clashing words were answered wrongly to measure the slowdown.');
    expect(meaningLine(scores)).not.toMatch(/\d+ ms/);
  });

  it('no correct answer on either word type: the clashing reason (Q2-16)', () => {
    const scores = calculateStroopScores([r(true, 400, false), r(false, 500, false)]);
    expect(meaningLine(scores)).toBe('Too many clashing words were answered wrongly to measure the slowdown.');
  });
});

describe('Stroop: band edges', () => {
  it('maps Stroop effect to correct bands at exact boundaries', () => {
    // Under 80 ms: Unshakeable (including 0 and negative)
    expect(getBand(-20).badge).toBe('Unshakeable');
    expect(getBand(0).badge).toBe('Unshakeable');
    expect(getBand(79).badge).toBe('Unshakeable');

    // 80–160 ms: Mild pull
    expect(getBand(80).badge).toBe('Mild pull');
    expect(getBand(160).badge).toBe('Mild pull');

    // 161–250 ms: Word-pulled
    expect(getBand(161).badge).toBe('Word-pulled');
    expect(getBand(250).badge).toBe('Word-pulled');

    // Over 250 ms: Strongly pulled
    expect(getBand(251).badge).toBe('Strongly pulled');
    expect(getBand(350).badge).toBe('Strongly pulled');
  });

  it('formats scalePercent and shareText correctly', () => {
    expect(scalePercent(0)).toBe(2);
    expect(scalePercent(160)).toBe(50);
    expect(scalePercent(320)).toBe(98);

    expect(shareText(120)).toBe('My Stroop effect: 120 ms, Mild pull. Can you beat it?');
  });
});
