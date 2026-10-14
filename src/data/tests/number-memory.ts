// Copy from docs/content/part-2.md, "Test 4 — Number Memory". Word for word.
// Lines marked "drafted" were missing from the content doc and approved in the build plan.
import type { Faq, Source } from '../shared';
import type { MemoryBand } from './photographic-memory';

/** Digits 3–5, 6–7, 8–9, 10+. A score under 3 reads as the first band. */
export const numberBands: MemoryBand[] = [
  // Drafted: removed comparison wording.
  { min: 0, badge: 'Warming up', text: 'Numbers slip away quickly. Try grouping them into pairs or threes.' },
  // Drafted: neutral badge name and task-framed band text.
  { min: 6, badge: 'Steady', text: 'Six or seven digits held at once, a steady span for this task.' },
  // Drafted: removed comparison wording.
  { min: 8, badge: 'Strong', text: 'You hold eight or more digits before losing track.' },
  { min: 10, badge: 'Exceptional', text: "You're likely using a smart strategy, like chunking." },
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
  metaLine: 'About 1–2 minutes · 2 lives · Nothing saved',
};

export const ui = {
  chunkTip: 'Tip: try splitting it into groups of 2 or 3.',
  // Drafted: removed comparison wording.
  middle: 'The middle digits are often the hardest to hold. The first and last digits are usually easier to keep in mind.',
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
  digits: (n: number) => `${n} digits`,
  livesLeft: (lives: number) => (lives === 1 ? '1 life left' : `${lives} lives left`),
  copyScore: 'Copy my score',
  leaveWarning: 'Your progress will be lost if you leave this page.',
};

export const result = {
  change:
    'Strategy matters most. Reading 49 21 73 as three chunks is easier than six single digits. Tiredness and distractions lower scores.',
  // Try this = FAQ 3's answer (approved in the build plan).
  tip: 'Group digits into chunks of two or three, say them in a rhythm, or link them to dates you know.',
  // Next test (name, link, time) comes from nextAfter() in data/home.ts, in doc order.
  // Drafted: the doc's line points back to Photographic memory; the chain now follows the doc order 1–7.
  nextLine: "You've tested your memory. Now see how well you stay focused in the Attention span test.",
  learn: { href: '/method/', label: 'How we build our tests →' },
};

export const faqs: Faq[] = [
  { q: 'What is digit span?', a: "The longest string of numbers you can repeat back right after seeing or hearing it. It's a classic way to measure short-term memory." },
  { q: 'What is a normal digit span?', a: 'A famous 1956 paper suggested people hold about "seven, plus or minus two" items. Later research suggests our true limit is closer to four chunks.' },
  { q: 'How can I improve my number memory?', a: 'Group digits into chunks of two or three, say them in a rhythm, or link them to dates you know.' },
  { q: 'Is this a medical test?', a: "No. It's for curiosity and self-reflection." },
];

export const sources: Source[] = [
  { before: 'Miller, G. A. (1956). The magical number seven, plus or minus two. ', title: 'Psychological Review', after: '.' },
  { before: 'Cowan, N. (2001). The magical number 4 in short-term memory. ', title: 'Behavioral and Brain Sciences', after: '.' },
];
