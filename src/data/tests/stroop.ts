// Copy from docs/content/part-2.md, "Test 6 — Stroop Test". Word for word.
// Lines marked "Drafted" are not in the content doc: written for the build, waiting for Dev's review.
import type { Faq, Source } from '../shared';

export interface StroopBand {
  min: number;
  badge: string;
  text: string;
}

/** Bands: Under 80 ms (Unshakeable), 80–160 ms (Typical), 161–250 ms (Word-pulled), Over 250 ms (Strongly pulled). */
export const stroopBands: StroopBand[] = [
  { min: -Infinity, badge: 'Unshakeable', text: 'The clashing words barely slowed you down.' },
  { min: 80, badge: 'Typical', text: "Your brain read the word anyway, like almost everyone's does." },
  { min: 161, badge: 'Word-pulled', text: 'The words pulled hard on your attention.' },
  { min: 251, badge: 'Strongly pulled', text: 'Reading is very automatic for you — the words won the tug-of-war.' },
];

export const page = {
  title: 'Stroop Test — Can Your Brain Ignore the Word?',
  description:
    'Name the ink colour, not the word. A 1-minute version of a famous 1935 experiment. See how much clashing words slow you down — free, instant.',
  h1: 'Stroop test',
  intro: 'A colour word will appear in coloured ink. Click the button for the INK colour — ignore what the word says. Be fast, but accurate.',
  // Drafted: touch screens get the same line with "Tap" (shared rule).
  introTouch: 'A colour word will appear in coloured ink. Tap the button for the INK colour — ignore what the word says. Be fast, but accurate.',
  crumb: 'Stroop test',
  // Drafted (eyebrow and metaLine).
  eyebrow: 'Test / 06 · Focus · 1 min',
  metaLine: 'About 1 minute · 40 words · Nothing saved',
};

export const ui = {
  colourVisionNote: 'This test relies on telling colours apart, so it may not work well for people with colour-vision differences.',
  // Drafted: the doc says the note "allows a skip" but gives no link text.
  skipNote: 'Skip to the attention span test →',
  lowAccuracyNote: 'You were fast but made several mistakes — try again a little slower for a fairer score.',
  // Drafted: the doc says "4 rounds with feedback" but gives no lines. Everything from here to the end of `ui`.
  practiceCorrect: 'Correct!',
  practiceWrong: 'Oops — pick the ink colour, not what the word says.',
  practiceMissed: "Time's up — answer within 3 seconds next time.",
  ready: 'Click or press Space to start practice.',
  readyTouch: 'Tap to start practice.',
  practiceLabel: 'Practice round',
  practiceNote: '4 rounds with feedback · not scored',
  practiceCount: (n: number, total: number) => `Practice · ${n} / ${total}`,
  practiceDoneTitle: 'Practice complete',
  practiceDoneText: 'Ready for the real test? 40 words in random order. Be fast, but accurate.',
  practiceDoneNote: 'Ready for the real test',
  mainNote: '40 words · be fast and accurate',
  choicesLabel: 'Ink colour choices',
  startMain: 'Start the test',
  wordCount: (n: number, total: number) => `Word ${n} / ${total}`,
  pausedTitle: 'Test paused',
  pausedMessage: 'The window lost focus or was hidden. To keep scores accurate, please restart the test.',
  restart: 'Restart ↺',
  leaveWarning: 'Your progress will be lost if you leave this page.',
  copyScore: 'Copy my score',
};

/** Drafted: labels on the result's comparison card and the share card. */
export const resultUi = {
  eyebrow: 'Your result · Stroop test',
  cardTitle: 'Comparison & accuracy',
  matching: 'Matching words',
  clashing: 'Clashing words',
  accuracy: 'Overall accuracy',
  shareLabel: 'My Stroop effect',
  shareTagline: 'Can your brain ignore the word?',
};

export const result = {
  change: 'Reading speed, practice, tiredness and how fast you try to go.',
  // Drafted: the doc gives no "Try this" tip.
  tip: 'Try again a little slower and see if the gap shrinks.',
  // Drafted: the doc's "What does it mean?" line only covers a positive slow-down.
  noSlowdown: "Clashing words didn't slow you down.",
  // Drafted: shown when either word type has no correct answer, so there's no effect to report.
  notMeasured: "We couldn't measure this one. Try again.",
  // Next test (name, link, time) comes from nextAfter() in data/home.ts, in doc order.
  // Drafted: the doc's line points back to Attention span; the chain now follows the doc order 1–7.
  nextLine: 'Now a change of pace: see how well you notice and handle feelings.',
  learn: { href: '/method/', label: 'How we build our tests →' },
};

export const faqs: Faq[] = [
  {
    q: 'What is the Stroop effect?',
    a: 'Naming the ink colour takes longer when the word names a different colour. Reading is so automatic that it gets in the way.',
  },
  {
    q: 'Who discovered it?',
    a: 'J. Ridley Stroop, in experiments published in 1935.',
  },
  {
    q: 'What does the Stroop test measure?',
    a: 'How well you can focus on one thing (the ink) while ignoring a strong habit (reading the word).',
  },
  {
    q: 'Is a bigger Stroop effect bad?',
    a: "Not really — it mostly shows how automatic your reading is. It's a fun look at how your attention works, not a grade.",
  },
  {
    q: 'Is this a medical test?',
    a: "No. It's for curiosity and self-reflection.",
  },
];

export const sources: Source[] = [
  {
    before: 'Stroop, J. R. (1935). Studies of interference in serial verbal reactions. ',
    title: 'Journal of Experimental Psychology',
    after: '.',
  },
  {
    before: 'MacLeod, C. M. (1991). Half a century of research on the Stroop effect. ',
    title: 'Psychological Bulletin',
    after: '.',
  },
];
