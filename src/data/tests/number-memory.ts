// Copy from docs/content/part-2.md, "Test 4 — Number Memory". Word for word.
// Lines marked "drafted" were missing from the content doc and approved in the build plan.
import type { Faq, Source, Happening } from '../shared';
import type { MemoryBand } from './photographic-memory';

/** Digits 3–5, 6–7, 8–9, 10+. A score under 3 reads as the first band. */
export const numberBands: MemoryBand[] = [
  // Drafted: removed comparison wording.
  { min: 0, badge: 'Warming up', text: 'Numbers slip away quickly. Try grouping them into pairs or threes.' },
  // Drafted: neutral badge name and task-framed band text.
  { min: 6, badge: 'Steady', text: 'Six or seven digits held at once, a steady span for this task.' },
  // Drafted: removed comparison wording.
  { min: 8, badge: 'Strong', text: 'You hold eight or more digits before losing track.' },
  { min: 10, badge: 'Exceptional', text: "You recalled a long digit string in this run." },
];

export const page = {
  // Drafted: em dash removed.
  title: 'Number Memory Test: How Many Digits Can You Hold?',
  // Drafted: em dash removed.
  description: 'Remember a number, then type it back. It grows by one digit each round. Free, instant, no sign-up. Find your digit span.',
  h1: 'Number memory test',
  intro: 'A number will appear for a few seconds. When it disappears, type it in. Each round adds one digit.',
  crumb: 'Number memory',
  // Drafted.
  eyebrow: 'Test / 04 · Memory · 1–2 min',
  metaLine: 'About 1–2 minutes · 2 lives · Saved only if you choose',
};

export const ui = {
  chunkTip: 'Tip: try splitting it into groups of 2 or 3.',
  // Drafted: removed comparison wording.
  middle: 'Optional suggestion: notice which positions you recalled or missed.',
  // Drafted.
  ready: 'The number will appear here.',
  remember: 'Remember this number',
  type: 'Type the number',
  correct: 'Correct',
  wrong: 'Not quite',
  rightNumber: 'Right number',
  yourAnswer: 'Your answer',
  empty: '(nothing typed)',
  nextNumber: 'Next number',
  seeResult: 'See my result',
  submit: 'Submit',
  // Drafted (Q2-19, Dev's wording): announced when Enter is pressed with nothing typed.
  emptyAnswer: 'Type the digits you saw, then press Enter.',
  digits: (n: number) => `${n} digits`,
  livesLeft: (lives: number) => (lives === 1 ? '1 life left' : `${lives} lives left`),
  copyScore: 'Copy my score',
  leaveWarning: 'Your progress will be lost if you leave this page.',
};

export const result = {
  change:
    'The result records the longest string recalled here. It does not identify the cause of a missed number.',
  // Try this = FAQ 3's answer (approved in the build plan).
  tip: 'Optional suggestion: try grouping digits in a way that is meaningful to you. This is not a proven improvement method for our game.',
  // Drafted (Q2-12, Dev's wording): "What does it mean?" for a score of 0, instead of "You held 0 digits."
  zeroLine: 'No number landed this time. That happens, and a fresh try often goes differently.',
  // Next test (name, link, time) comes from nextAfter() in data/home.ts, in doc order.
  // Drafted: the doc's line points back to Photographic memory; the chain now follows the doc order 1–7.
  nextLine: "You've tested your memory. Now see how well you stay focused in the Attention span test.",
  learn: { href: '/method/', label: 'How we build our tests →' },
};

export const faqs: Faq[] = [
  { q: 'What is digit span?', a: "The longest string of numbers you can repeat back right after seeing or hearing it. It's a classic way to measure short-term memory." },
  { q: 'What is a normal digit span?', a: 'Miller discussed span and chunking historically. Cowan argued for around four chunks under specified conditions limiting rehearsal and grouping, rather than a universal digit-span limit.' },
  { q: 'How can I improve my number memory?', a: 'Optional suggestion: try grouping digits in a way that is meaningful to you. This is not a proven improvement method for our game.' },
  { q: 'Is this a medical test?', a: "No. It's for curiosity and self-reflection." },
];

export const sources: Source[] = [
  { before: 'Miller, G. A. (1956). The magical number seven, plus or minus two: Some limits on our capacity for processing information. ', title: 'Psychological Review', after: '.' },
  { before: 'Cowan, N. (2001). The magical number 4 in short-term memory: a reconsideration of mental storage capacity. ', title: 'Behavioral and Brain Sciences', after: '.' },
];

// "What's happening in this test?" (D1). Every line Drafted, checked against src/lib/tests/number-memory.ts and the page script.
export const happening: Happening = {
  steps: [
    // Drafted.
    { title: 'Look.', text: 'A number appears for 1 second plus 0.6 seconds for each digit, then disappears.' },
    // Drafted.
    { title: 'Type it back.', text: 'Type the number from memory and submit it.' },
    // Drafted.
    { title: 'One digit longer.', text: 'It starts at 3 digits. Each right answer adds a digit. A wrong answer costs one of your two lives, and you get a new number of the same length.' },
    // Drafted.
    { title: 'Your score.', text: 'Your score is the longest number you typed back correctly.' },
  ],
  // Drafted.
  change: 'the digits entered in this session. These sources do not establish which factor explains your score.',
  article: 'short-term-memory-capacity',
};
