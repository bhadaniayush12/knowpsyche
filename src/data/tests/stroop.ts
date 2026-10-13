// Copy from docs/content/part-2.md, "Test 6 — Stroop Test". Word for word.
// Lines marked "drafted" were missing from the content doc and approved in the build plan.
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
  crumb: 'Stroop test',
  // Drafted.
  eyebrow: 'Test / 06 · Focus · 1 min',
  metaLine: 'About 1 minute · 40 words · Nothing saved',
};

export const ui = {
  colourVisionNote: 'This test relies on telling colours apart, so it may not work well for people with colour-vision differences.',
  skipNote: 'Skip to the attention span test →',
  lowAccuracyNote: 'You were fast but made several mistakes — try again a little slower for a fairer score.',
  // Practice feedback (part-2.md).
  practiceCorrect: 'Correct!',
  practiceWrong: 'Oops — pick the ink colour, not what the word says.',
  practiceMissed: 'Too slow — answer within 3 seconds.',
  // Drafted UI lines.
  ready: 'Click or press a key to start practice.',
  practiceLabel: 'Practice round',
  practiceNote: '4 rounds with feedback · not scored',
  practiceFinished: 'Practice finished. Ready for the real test?',
  startMain: 'Start the test',
  wordCount: (n: number, total: number) => `Word ${n} / ${total}`,
  // Drafted (same as the attention span test).
  pausedTitle: 'Test paused',
  pausedMessage: 'The window lost focus or was hidden. To keep scores accurate, please restart the test.',
  restart: 'Restart ↺',
  leaveWarning: 'Your progress will be lost if you leave this page.',
  copyScore: 'Copy my score',
};

export const result = {
  change: 'Reading speed, practice, tiredness and how fast you try to go.',
  // Try this tip (drafted per pattern).
  tip: 'Try unfocusing your eyes slightly or saying the colour out loud — it can help you see the ink before your brain reads the word.',
  next: {
    href: '/attention-span-test/',
    name: 'Attention span',
    time: '2–3 min',
    line: 'Try the Attention span test to see how well you hold back an automatic response.',
  },
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
